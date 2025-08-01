import { Request, Response, NextFunction} from "express";
import ApiError from "../error/ApiError.js";
import models from "../models/models.js"; 
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { v4 } from 'uuid';
import path from 'path'
import fileUpload from 'express-fileupload'
import { fileURLToPath } from 'url';
import mailService from '../service/mailService.js'
import TokenService from "../service/tokenService.js";
import UserDto from "../dtos/userDto.js";
import { validationResult } from "express-validator";

const {User, Doctor, Patient} = models;

const generateJwt = (id: number, email: string, role: string) => {
    return jwt.sign({id, email, role}, process.env.SECRET_KEY as string, {expiresIn: '24h'})
}

class UserController {
    static async registrations(req: Request, res: Response, next: NextFunction) {
        try {
            const errors = validationResult(req);
            if(!errors.isEmpty()) {
                return next(ApiError.badRequest('Ошибка валидации'))
            }

            const {email, password, role, name, surname, patronymic, phone, pin_code, gender, date_birth, time_zone} = req.body

            if (!req.files || !req.files.img) {
                return next(ApiError.internal('Файл изображения не загружен'));
            }
            
            const img = req.files.img as fileUpload.UploadedFile; 
            const fileName = v4() + '.jpg';
            const filePath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..','static', fileName);

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
                img: fileName,
                activationLink,
                isActivated: false
            })

            let patient = {};
            let doctor = {};
            if(user.role === 'PATIENT') {
                const {general_info, analyses_examinations, additionally} = req.body;
                if(!general_info || !analyses_examinations || !additionally) {
                    next(ApiError.badRequest('Данные для пациента не пришли'))
                }
                patient = await Patient.create({general_info, analyses_examinations, additionally})
            } else if(user.role === 'DOCTOR') {
                const {specialization, contacts, experience_years} = req.body;
                if(!specialization || !contacts || !experience_years) {
                    next(ApiError.badRequest('Данные для доктора не пришли'))
                }
                doctor = await Doctor.create({specialization, contacts, experience_years});
            } else {
                next(ApiError.badRequest('Неизвестная роль'))
            }

            await img.mv(filePath);
            const userDto = new UserDto(user);
            const tokens = TokenService.generateTokens({...userDto})
            await TokenService.saveToken(userDto.id, tokens.refreshToken);
            
            res.cookie('refreshtoken', tokens.refreshToken, {maxAge: 30 * 24 * 60 *60 * 1000, httpOnly: true, secure: true})
            return res.json({...tokens, user: userDto, patient, doctor});
        } catch(e) {
            if (e instanceof Error) {
                next(ApiError.badRequest(e.message));
            } else {
                next(ApiError.badRequest('Неизвестная ошибка'));
            }
        }
    }

    static async login(req: Request, res: Response, next: NextFunction) {
        const {email, phone, password, pin_code} = req.body;
        let user;
        if(email && !phone) {
            user = await User.findOne({where: {email, pin_code}})
        } else if(!email && phone) {
            user = await User.findOne({where: {phone, pin_code}})
        }

        if (!user) {
            return next(ApiError.internal('Пользователь не найден'))
        }

        let comparePassword = bcrypt.compareSync(password, user.password)
        
        if(!comparePassword) {
            return next(ApiError.internal('Не верный пароль'));
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
            const user = await User.findByPk(userData.id)
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
                res.status(200).json({check: false});
            }

            if(!user) {
                res.status(200).json({check: false});
            }

            res.status(200).json({check: true});
        } catch (e) {
            next(ApiError.badRequest('Ошибка при проверке пользователя'));
        }
    }
}

export default UserController;