import { Request, Response, NextFunction } from "express";
import AuthService from "../../../../core/domain/services/auth.service.js";
import UserRepository from "../../../../core/domain/repositories/user.repository.js";
import ApiError from "../../error/ApiError.js"
import TokenService from "../../../../core/domain/services/token.service.js";
import { UserModelInterface } from "../../../persostence/models/interfaces/user.model.js";

export default class UserController {
    constructor(
        private readonly authService: AuthService,
        private readonly userRepository: UserRepository,
        private readonly tokenService: TokenService
    ) {}

    async registration(req: Request, res: Response, next: NextFunction) {
        try {
            const {email, password, role, name, surname, patronymic, phone, pin_code, gender, date_birth, time_zone, specialization, contacts, experienceYears} = req.body;
            const result = await this.authService.register(email, password, role, name, surname, patronymic, phone, pin_code, gender, new Date(date_birth), time_zone, specialization, contacts, experienceYears);

            res.cookie("refreshToken", result.refreshToken, {
                maxAge: 24 * 60 * 60 * 1000,
                httpOnly: true,
                secure: true,
            });

            return res.json({
                accessToken: result.accessToken,
                user: result.user,
            });
        } catch (e: any) {
            return next(ApiError.badRequest(e.message));
        }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const {email, phone, password, pin_code} = req.body;
            
            let credential;
            if(!phone) {
                credential = email;
            } else if (!email) {
                credential = phone;
            }

            const result = await this.authService.login(credential, password, pin_code);

            res.cookie("refreshToken", result.refreshToken, {
                maxAge: 24 * 60 * 60 * 1000,
                httpOnly: true,
                secure: true,
            });

            return res.json({
                accessToken: result.accessToken,
                user: result.user,
            });
        } catch(e: any) {
            return next(ApiError.badRequest(e.message));
        }
    }

    async logout(req: Request, res: Response, next: NextFunction) {
        try {
            const {refreshToken} = req.cookies;
            await this.authService.logout(refreshToken);
            res.clearCookie('refreshToken');
            return res.json({ message: "Успешный выход" });
        } catch(e: any) {
            return next(ApiError.badRequest(e.message))
        }
    }

    async getOne(req: Request, res: Response, next: NextFunction) {
        try {
            const {id} = req.params;
            const user = await this.userRepository.findById(Number(id))
            if(!user) {
                return next(ApiError.badRequest('Пользователь не найден'));
            } 
            return res.status(200).json(user);
        } catch(e: any) {
            return next(ApiError.badRequest(e.message))
        }
    }

    async check(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return next(ApiError.internal('Пользователь не авторизован'));
            }
            const tokens = this.tokenService.generateTokens({...req.user})
            return res.status(200).json({tokens})
        } catch(e: any) {
            return next(ApiError.badRequest(e.message))
        }
    }

    async checkPinCode(req: Request, res: Response, next: NextFunction) {
        try {
            const {userId, pin_code} = req.body;
            const user = await this.userRepository.findById(userId) as unknown as UserModelInterface;
            const userVerify = await this.userRepository.verifyPinCode(user.id, pin_code);
            if(!userVerify) {
                return res.status(404).json({pin_code: false});
            }
            return res.status(200).json({pin_code: true});
        } catch(e: any) {
            return next(ApiError.badRequest(e.message))
        }
    }
    
    async requestPasswordReset(req: Request, res: Response, next: NextFunction) {
        try {
            const { email } = req.body;
            if (!email) {
                return res.json({ 
                    success: false, 
                    message: `Почта не указана` 
                });
            }

            const user = await this.userRepository.findByEmail(email);
            
            if (!user) {
                return res.json({ 
                    success: false, 
                    message: `Пользователь с почтой ${email} не найден` 
                });
            }

        } catch(e: any) {
            return next(ApiError.badRequest(e.message))
        }
    }
}