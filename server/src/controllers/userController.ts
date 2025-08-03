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

const {User, Patient, Doctor} = models;

const generateJwt = (id: number, email: string, role: string) => {
    return jwt.sign({id, email, role}, process.env.SECRET_KEY as string, {expiresIn: '24h'})
}

class UserController {
    static async registrations(req: Request, res: Response, next: NextFunction) {
        try {
            const {email, password, role, name, surname, patronymic, phone, pin_code, gender, date_birth, time_zone} = req.body

            // let img, filePath, fileName;
            // if(req.files) {
            //     img = req.files?.img as fileUpload.UploadedFile; 
            //     fileName = v4() + '.jpg';
            //     filePath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..','static', fileName);
            // }

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
                img: "",
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

            // await img?.mv(filePath);
            const userDto = new UserDto(user);
            const tokens = TokenService.generateTokens({...userDto})
            await TokenService.saveToken(userDto.id, tokens.refreshToken);
            
            res.cookie('refreshtoken', tokens.refreshToken, {maxAge: 30 * 24 * 60 *60 * 1000, httpOnly: true, secure: true})
            return res.json({...tokens, user: userDto, patient: patient, doctor: doctor});
        } catch(e) {
            if (e instanceof Error) {
                next(ApiError.badRequest(e.message));
            } else {
                next(ApiError.badRequest('Неизвестная ошибка'));
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

        return res.json({...tokens, user: userDto});
    }

    static async logout(req: Request, res: Response, next: NextFunction) {
        try {
            const {refreshToken} = req.cookies;
            const token = await TokenService.removeToken(refreshToken)
            res.clearCookie('refreshToken')
            return res.json(token)
        } catch (error) {
            if (error instanceof ApiError) {
                return next(error);
            }
            if (error instanceof Error) {
                return next(ApiError.internal('Ошибка при выходе из системы').withOriginalError(error));
            }

            return next(ApiError.internal('Неизвестная ошибка при выходе из системы'));
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
            
        } catch(e) {

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
            next(ApiError.badRequest('Ошибка при получении пользователя с ролью доктор'));
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
}

export default UserController;