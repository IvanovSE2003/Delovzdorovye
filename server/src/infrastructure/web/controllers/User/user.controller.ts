import { Request, Response, NextFunction } from "express";
import AuthService from "../../../../core/domain/services/auth.service.js";
import UserRepository from "../../../../core/domain/repositories/user.repository.js";
import ApiError from "../../error/ApiError.js"
import TokenService from "../../../../core/domain/services/token.service.js";
import { UserModelInterface } from "../../../persostence/models/interfaces/user.model.js";
import User from "../../../../core/domain/entities/user.entity.js";
import { Api } from "grammy";

export default class UserController {
    constructor(
        private readonly authService: AuthService,
        private readonly userRepository: UserRepository,
        private readonly tokenService: TokenService
    ) {}

    async registration(req: Request, res: Response, next: NextFunction) {
        try {
            const {email, role, name, surname, patronymic, phone, pin_code, gender, date_birth, time_zone, specialization, contacts, experienceYears} = req.body;
            const result = await this.authService.register(email, role, name, surname, patronymic, phone, pin_code, gender, new Date(date_birth), time_zone, specialization, contacts, experienceYears);

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
            const {email, phone, pin_code} = req.body;
            
            let credential = email ? email : phone

            const result = await this.authService.login(credential, pin_code);

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
            const tokens = await this.tokenService.generateTokens({...req.user})
            return res.status(200).json({tokens})
        } catch(e: any) {
            return next(ApiError.badRequest(e.message))
        }
    }
    
    async checkUser(req: Request, res: Response, next: NextFunction) {
        try {
            const {phone, email} = req.body;
            const creditial = email ? email : phone;
            const user = await this.userRepository.findByEmailOrPhone(creditial) as any;
            if(!user) {
                return res.status(404).json({check: false, message: 'Такого пользователя не существует'});
            }
            return res.status(200).json({check: true, message: 'Пользователь существует'});
        } catch(e: any) {
            return next(ApiError.internal(e.message))
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
    
    async activate(req: Request, res: Response, next: NextFunction) {
        try {
            const activationLink = req.params.link;
            
            if (!activationLink) {
                return next(ApiError.badRequest('Некорректная ссылка активации'));
            }

            const user = await this.userRepository.findByActivationLink(activationLink);
            if (!user) {
                return res.status(200).json({ 
                    success: false, 
                    message: 'Пользователь не найден' 
                });
            }

            if (user.isActivated) {
                return res.status(200).json({ 
                    success: true, 
                    message: 'Аккаунт уже был активирован ранее' 
                });
            }

            const isActivated = await this.authService.activate(activationLink, user.id);
            if (!isActivated) {
                return res.status(200).json({ 
                    success: false, 
                    message: 'Ошибка при активации аккаунта' 
                });
            }

            return res.status(200).json({ 
                success: true, 
                message: 'Аккаунт успешно активирован' 
            });
            
        } catch(e: any) {
            return next(ApiError.internal(e.message));
        }
    }

    async refresh(req: Request, res: Response, next: NextFunction) {
        const { refreshToken } = req.cookies;
        if (!refreshToken) {
            return next(ApiError.notAuthorized('Пользователь не авторизован'));
        }
        const userPayload = await this.tokenService.validateRefreshToken(refreshToken);

        if (!userPayload || typeof userPayload === 'string') {
            return next(ApiError.notAuthorized('Невалидный токен'));
        }
        if (!userPayload.id || !userPayload.email) {
            return next(ApiError.notAuthorized('Токен не содержит необходимых данных'));
        }
        
        const tokenFromDb = await this.tokenService.findToken(refreshToken);

        if (!tokenFromDb) {
            return next(ApiError.notAuthorized('Токен не найден в базе'));
        }

        const user = await this.userRepository.findById(userPayload.id);
        if (!user) {
            return next(ApiError.notAuthorized('Пользователь не найден'));
        }

        const tokens = await this.tokenService.generateTokens({...user});
        await this.tokenService.saveToken(user.id, tokens.refreshToken);

        res.cookie('refreshtoken', tokens.refreshToken, {
            maxAge: 30 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: true
        });

        return res.json({
            accessToken: tokens.accessToken,
            user: user
        });
    }

    async verifyTwoFactor(req: Request, res: Response, next: NextFunction) {
        try {
            const { tempToken, code } = req.body;
            
            if (!tempToken || !code) {
                return next(ApiError.badRequest('Необходимы временный токен и код подтверждения'));
            }

            const tokens = await this.authService.completeTwoFactorAuth(tempToken, code);
            
            res.cookie("refreshToken", tokens.refreshToken, {
                maxAge: 24 * 60 * 60 * 1000,
                httpOnly: true,
                secure: true,
            });

            return res.json({
                accessToken: tokens.accessToken
            });
        } catch (e: any) {
            return next(ApiError.badRequest(e.message));
        }
    }

    async sendTwoFactor(req: Request, res: Response, next: NextFunction) {
        try {
            const {method, email, phone} = req.body;
            if(!method && !email && !phone) {
                return next(ApiError.badRequest('Данные не получены'));
            }
            const creditial = email ? email : phone;
            await this.authService.sendTwoFactorCode(creditial, method);
            return res.status(200).json({message: 'Код успешно отправлен'});
        } catch(e: any) {
            next(ApiError.badRequest(e.message));
        }
    }

    async checkVarifyCode(req: Request, res: Response, next: NextFunction) {
        try {
            const {code, email, phone} = req.body;

            if(!code && !email && !phone) {
                return res.status(404).json({code: false, message: 'Данные не получены'});
            }
            const credential = email ? email : phone;
            const user = await this.userRepository.findByEmailOrPhone(credential) as User;

            if(!user) {
                return res.status(404).json({code: false, message: 'Пользователь не найден'});
            }

            const isCodeValid = await this.authService.verifyTwoFactorCode(user.id, code);
            if(!isCodeValid) {
                return res.status(404).json({code: false, message: 'Не верный код'});
            }

            return res.status(200).json({code: true, message: 'Верный код'});
        } catch(e: any) {
            next(ApiError.badRequest(e.message));
        }
    }

    async sendLoginNotification(req: Request, res: Response, next: NextFunction) {
        try {
            const {phone, code} = req.body;
            
            if (!phone) {
                return next(ApiError.badRequest('Телефон не указан'));
            }

            await this.authService.sendLoginNotification(phone, code);
            return res.json({ success: true, message: 'Уведомление отправлено' });
        } catch (e: any) {
            return next(ApiError.internal(e.message));
        }
    }

    async linkTelegram(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.params; 
            if (!userId) {
                return next(ApiError.badRequest('Пользователь не авторизован'));
            }

            const token = await this.authService.generateTelegramLinkToken(Number(userId));
            
            return res.json({
                success: true,
                token,
                instructions: 'Введите этот код в Telegram боте командой /link [код]'
            });
        } catch(e: any) {
            return next(ApiError.badRequest(e.message));
        }
    }
}