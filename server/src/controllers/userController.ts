import { Request, Response, NextFunction} from "express";
import ApiError from "../error/ApiError.js";
import models from "../models/models.js"; 
import jwt from "jsonwebtoken"
import TokenService from "../service/tokenService.js";
import UserDto from "../dtos/userDto.js";
import path from 'path';
import fileUpload from "express-fileupload";
import { fileURLToPath } from "url";
import {v4} from 'uuid';
import bcrypt from 'bcrypt';
import mailService from "../service/mailService.js";
import { Op } from 'sequelize';

const {User, Patient, Doctor} = models;

const generateJwt = (id: number, email: string, role: string) => {
    return jwt.sign({id, email, role}, process.env.SECRET_KEY as string, {expiresIn: '24h'})
}

class UserController {
    static async registrations(req: Request, res: Response, next: NextFunction) {
        try {
            const {email, password, role, name, surname, patronymic, phone, pin_code, gender, date_birth, time_zone} = req.body

            if(!email || !password) {
                return next(ApiError.badRequest('Некорректный email или пароль'))
            }

            const candidate = await User.findOne({where: {email}})
            if(candidate) {
                return next(ApiError.badRequest('Пользователь с таким email уже есть в системе'))
            }

            const hashPassoword = await bcrypt.hash(password, 5)
            const activationLink = v4();
            await mailService.sendActivationEmail(email, activationLink);

            const user = await User.create({
                email, 
                role, 
                password: hashPassoword, 
                name, 
                surname, 
                patronymic, 
                phone, 
                pin_code, 
                gender, 
                date_birth, 
                time_zone, 
                img: "defaultImg.jpg",
                activationLink,
                isActivated: false
            })

            let patient = {};
            let doctor = {};
            console.log(user.role)
            if(user.role == 'PACIENT') {
                patient = await Patient.create({general_info: null, analyses_examinations: null, additionally: null, userId: user.id})
            } else if(user.role == 'DOCTOR') {
                const {specialization, contacts, experience_years} = req.body;
                if(!specialization || !contacts || !experience_years) {
                    return next(ApiError.badRequest('Данные для доктора не пришли'))
                }
                doctor = await Doctor.create({specialization, contacts, experience_years});
            } else {
                return next(ApiError.badRequest('Неизвестная роль'))
            }

            const userDto = new UserDto(user);
            const tokens = TokenService.generateTokens({...userDto})
            await TokenService.saveToken(userDto.id, tokens.refreshToken);
            
            res.cookie('refreshtoken', tokens.refreshToken, {maxAge: 30 * 24 * 60 *60 * 1000, httpOnly: true, secure: true})
            return res.json({...tokens, user: userDto, patient: patient, doctor: doctor});
        } catch(e) {
            if (e instanceof Error) {
                return next(ApiError.badRequest(e.message));
            } else {
                return next(ApiError.badRequest('Неизвестная ошибка'));
            }
        }
    }

    static async login(req: Request, res: Response, next: NextFunction) {
        const {email, phone, password} = req.body;
        
        let user;
        if(email && !phone) {
            user = await User.findOne({where: {email}});
        } else if(!email && phone) {
            user = await User.findOne({where: {phone}});
        } else {
            return next(ApiError.internal('Укажите email или телефон'));
        }

        if (!user) {
            return next(ApiError.internal('Пользователь не найден'));
        }

        let comparePassword = bcrypt.compareSync(password, user.password)
        
        if(!comparePassword) {
            return next(ApiError.internal('Не верный пароль'));
        }

        if(!user) {
            return next(ApiError.internal('Ошибка при авторизации'));
        }

        const userDto = new UserDto(user);
        const tokens = TokenService.generateTokens({...userDto})
        await TokenService.saveToken(userDto.id, tokens.refreshToken);

        res.cookie('refreshtoken', tokens.refreshToken, { 
            maxAge: 30 * 24 * 60 * 60 * 1000, 
            httpOnly: true, 
            secure: true 
        })

        return res.json({...tokens, user: userDto});
    }

    static async logout(req: Request, res: Response, next: NextFunction) {
        try {
            const {refreshtoken} = req.cookies;
            if (!refreshtoken) {
                return next(ApiError.badRequest('Токен не передан'));
            }
            
            await TokenService.removeToken(refreshtoken);
            res.clearCookie('refreshtoken');
            return res.json({ 
                success: true, 
                message: 'Выход выполнен успешно' 
            });
        } catch (error) {
            return next(ApiError.errorValidation('Ошибка при выходе из системы', error));
        }
    }

    static async check(req: Request, res: Response, next: NextFunction) {
        if (!req.user) {
            return next(ApiError.internal('Пользователь не авторизован'));
        }
        const token = generateJwt(req.user.id as number, req.user.email, req.user.role);
        return res.json({token});
    }

    static async activate(req: Request, res: Response, next: NextFunction) {
        try {
            const activationLink = req.params.link;
            
            if (!activationLink) {
                return next(ApiError.badRequest('Некорректная ссылка активации'));
            }

            const user = await User.findOne({ where: { activationLink } });
            
            if (!user) {
                return next(ApiError.badRequest('Некорректная ссылка активации'));
            }

            if (user.isActivated) {
                return next(ApiError.badRequest('Аккаунт уже активирован'));
            }

            user.isActivated = true;
            await user.save();
            return res.json({ success: true, message: 'Аккаунт успешно активирован' });
        } catch (e) {
            return next(ApiError.internal('Ошибка при активации аккаунта'));
        }
    }

    static async refresh(req: Request, res: Response, next: NextFunction) {
        try {
            const {refreshToken} = req.cookies;
            if(!refreshToken) { 
                throw ApiError.notAuthorized('Пользователь не авторезирован');
            }
            const userData = TokenService.validateRefreshToken(refreshToken) as any;
            const tokenFromDb = await TokenService.findToken(refreshToken);
            if(!userData || !tokenFromDb) {
                throw ApiError.notAuthorized('Пользователь не авторезирован')
            }
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true, secure: true})
            return res.json(userData)
        } catch(e) {
            next(ApiError.badRequest('Ошибка при обновлении токена'))
        }
    }

    static async getUser(req: Request, res: Response, next: NextFunction) {
        try {
            const {id} = req.params;
            const user = await User.findOne({where: {id}});
            if(!user) {
                next(ApiError.badRequest('Пользователь не найден'));
            }
            return res.json({user})
        } catch (e) {
            if (e instanceof Error) {
                return next(ApiError.badRequest(e.message));
            } else {
                return next(ApiError.badRequest('Неизвестная ошибка'));
            }
        }
    }

    static async updateUser(req: Request, res: Response, next: NextFunction) {
        try {
            const {id} = req.params;
            const {email, role, name, surname, patronymic, phone, gender, date_birth, time_zone} = req.body || null;

            const userLast = await User.findByPk(id);
            const imgLast = userLast?.img;

            let img, filePath, fileName;
            if(req.files) {
                img = req.files?.img as fileUpload.UploadedFile; 
                fileName = v4() + '.jpg';
                filePath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..','static', fileName);
            }

            if(filePath) {
                await img?.mv(filePath);
            }
            
            const user = await User.update({email, role, name, surname, patronymic, phone, gender, date_birth, time_zone}, {where: {id}});
            if(!user) {
                return next(ApiError.badRequest('Пользователь не найден для обновления'))
            }
            return res.status(200).json(user);
        } catch(e) {
            if (e instanceof Error) {
                return next(ApiError.badRequest(e.message));
            } else {
                return next(ApiError.badRequest('Неизвестная ошибка'));
            }
        }
    }

    static async checkUser(req: Request, res: Response, next: NextFunction) {
        try {
            const {email, phone} = req.body
            let user;
            if(!email && phone) {
                user = await User.findOne({where: {phone}})
            } else if(email && !phone) {  
                user = await User.findOne({where: {email}})
            } else {
                res.status(403).json({check: false});
            }

            if(!user) {
                res.status(403).json({check: false});
            } else {
                res.status(200).json({check: true});
            }
        } catch (e) {
            let errorMessage = 'Ошибка при проверке пользователя';
            let errors: any[] = [];

            if (e instanceof Error) {
                errorMessage = e.message;
                errors = [{ msg: e.message }]; 
            } else if (typeof e === 'object' && e !== null && 'errors' in e) {
                errors = (e as { errors: any[] }).errors;
            }

            next(ApiError.errorValidation('Ошибка при проверке пользователя', errors));
        }

    }

    static async verifyPinCode(req: Request, res: Response, next: NextFunction) {
        try {
            const {userId, pin_code} = req.body;
            const user = await User.findOne({where: {id: userId, pin_code}});

            if(!user) {
                next(ApiError.internal('Пользователь не найден'));
            } 

            if(user?.pin_code !== pin_code) {
                res.status(404).json({pin_code: false});
            } else {
                res.status(200).json({pin_code: true});
            }
        } catch(e) {
            next(ApiError.internal('Ошибка проверки пик-кода для пользователя'))
        }
    }

    static async requestPasswordReset(req: Request, res: Response, next: NextFunction) {
        try {
            const { email } = req.body;
            
            if (!email) {
                return next(ApiError.badRequest('Email не указан'));
            }

            const user = await User.findOne({ where: { email } });
            
            if (!user) {
                return next(ApiError.badRequest('Пользователь с таким email не найден'));
            }

            const resetToken = v4();
            const resetTokenExpires = new Date(Date.now() + 3600000); 
            
            user.resetPasswordToken = resetToken;
            user.resetPasswordExpires = resetTokenExpires;
            await user.save();

            await mailService.sendPasswordResetEmail(email, resetToken);

            return res.json({ 
                success: true, 
                message: 'Письмо для сброса пароля отправлено на ваш email' 
            });
        } catch (e) {
            if (e instanceof Error) {
                return next(ApiError.badRequest(e.message));
            } else {
                return next(ApiError.badRequest('Неизвестная ошибка'));
            }
        }
    }

    static async resetPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { token } = req.params;
            const { newPassword } = req.body;

            if (!token || !newPassword) {
                return next(ApiError.badRequest('Токен или новый пароль не указаны'));
            }

            const user = await User.findOne({ 
                where: { 
                    resetPasswordToken: token,
                    resetPasswordExpires: { [Op.gt]: new Date() } 
                } 
            });

            if (!user) {
                return next(ApiError.badRequest('Неверный или просроченный токен сброса пароля'));
            }

            const hashPassword = await bcrypt.hash(newPassword, 5);
            
            user.password = hashPassword;
            user.resetPasswordToken = null;
            user.resetPasswordExpires = null;
            await user.save();

            return res.json({ 
                success: true, 
                message: 'Пароль успешно изменен' 
            });
        } catch (e) {
            if (e instanceof Error) {
                return next(ApiError.badRequest(e.message));
            } else {
                return next(ApiError.badRequest('Неизвестная ошибка'));
            }
        }
    }
}

export default UserController;