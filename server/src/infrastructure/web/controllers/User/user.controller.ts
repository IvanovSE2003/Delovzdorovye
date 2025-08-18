import { Request, Response, NextFunction } from "express";
import AuthService from "../../../../core/domain/services/auth.service.js";
import UserRepository from "../../../../core/domain/repositories/user.repository.js";
import ApiError from "../../error/ApiError.js"
import TokenService from "../../../../core/domain/services/token.service.js";
import { UserModelInterface } from "../../../persostence/models/interfaces/user.model.js";
import User from "../../../../core/domain/entities/user.entity.js";
import regData from "../../types/reqData.type.js";
import { UploadedFile } from 'express-fileupload';
import FileService from "../../../../core/domain/services/file.service.js";
import BatchRepository from "../../../../core/domain/repositories/batch.repository.js";
import dataResult from "../../types/dataResultAuth.js";

export default class UserController {
    constructor(
        private readonly authService: AuthService,
        private readonly userRepository: UserRepository,
        private readonly tokenService: TokenService,
        private readonly fileService: FileService,
        private readonly batchRepository: BatchRepository
    ) { }

    async registration(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, role, name, surname, patronymic, phone, pin_code, gender, date_birth, time_zone, specialization, experienceYears } = req.body;

            let diplomaFileName: string | null = null;
            let licenseFileName: string | null = null;

            if (req.files) {
                if (req.files.diploma) {
                    const diplomaFile = req.files.diploma as UploadedFile;
                    diplomaFileName = await this.fileService.saveFile(diplomaFile);
                }
                if (req.files.license) {
                    const licenseFile = req.files.license as UploadedFile;
                    licenseFileName = await this.fileService.saveFile(licenseFile);
                }
            }

            const data = { email, role, name, surname, patronymic, phone, pinCode: pin_code, gender, dateBirth: date_birth, timeZone: time_zone, specialization, experienceYears, diploma: diplomaFileName, license: licenseFileName } as unknown as regData;

            const result = await this.authService.register(data);

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
            const { email, phone, pin_code, twoFactorCode, twoFactorMethod } = req.body;
            let credential = email ? email : phone;

            const result = await this.authService.login(
                credential, 
                pin_code,
                twoFactorMethod,
                twoFactorCode
            ) as dataResult;

            if (result.requiresTwoFactor) {
                return res.json({
                    requiresTwoFactor: true,
                    tempToken: result.tempToken,
                    message: twoFactorMethod 
                        ? `Код подтверждения отправлен ${twoFactorMethod === 'EMAIL' ? 'на email' : 'по SMS'}` 
                        : 'Код подтверждения отправлен на email'
                });
            }

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

    async completeTwoFactorAuth(req: Request, res: Response, next: NextFunction) {
        try {
            const { tempToken, code } = req.body;
            
            const result = await this.authService.completeTwoFactorAuth(tempToken, code) as dataResult;

            res.cookie("refreshToken", result.refreshToken, {
                maxAge: 24 * 60 * 60 * 1000,
                httpOnly: true,
                secure: true,
            });

            return res.json({
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
                user: result.user,
            });
        } catch (e: any) {
            return next(ApiError.badRequest(e.message));
        }
    }

    async logout(req: Request, res: Response, next: NextFunction) {
        try {
            const { refreshToken } = req.cookies;
            await this.authService.logout(refreshToken);
            res.clearCookie('refreshToken');
            return res.json({ message: "Успешный выход" });
        } catch (e: any) {
            return next(ApiError.badRequest(e.message))
        }
    }

    async getOne(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const user = await this.userRepository.findById(Number(id))
            if (!user) {
                return next(ApiError.badRequest('Пользователь не найден'));
            }
            return res.status(200).json({
                img: user.img,
                surname: user.surname,
                name: user.name,
                patronymic: user.patronymic,
                gender: user.gender,
                dateBirth: user.dateBirth,
                timeZone: user.timeZone,
                phone: user.phone,
                email: user.email
            });
        } catch (e: any) {
            return next(ApiError.badRequest(e.message))
        }
    }

    async check(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return next(ApiError.internal('Пользователь не авторизован'));
            }
            const tokens = await this.tokenService.generateTokens({ ...req.user })
            return res.status(200).json({ tokens })
        } catch (e: any) {
            return next(ApiError.badRequest(e.message))
        }
    }

    async checkUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { creditial } = req.body;
            const user = await this.userRepository.findByEmailOrPhone(creditial) as User;
            if (!user) {
                return res.status(404).json({ success: false, message: 'Такого пользователя не существует' });
            }
            return res.status(200).json({ success: true, message: 'Пользователь существует' });
        } catch (e: any) {
            return next(ApiError.internal(e.message))
        }
    }

    async checkPinCode(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId, pin_code } = req.body;
            const user = await this.userRepository.findById(userId) as unknown as UserModelInterface;
            const userVerify = await this.userRepository.verifyPinCode(user.id, pin_code);
            if (!userVerify) {
                return res.status(404).json({ pin_code: false });
            }
            return res.status(200).json({ pin_code: true });
        } catch (e: any) {
            return next(ApiError.badRequest(e.message))
        }
    }

    async activate(req: Request, res: Response, next: NextFunction) {
        try {
            const activationLink = req.params.link;

            if (!activationLink) {
                return res.status(400).send(this.renderHtmlPage('Некорректная ссылка активации', false));
            }

            const user = await this.userRepository.findByActivationLink(activationLink);
            if (!user) {
                return res.status(404).send(this.renderHtmlPage('Пользователь не найден', false));
            }

            if (user.isActivated) {
                return res.status(200).send(this.renderHtmlPage('Аккаунт уже был активирован ранее', true));
            }

            const isActivated = await this.authService.activate(activationLink, user.id);
            if (!isActivated) {
                return res.status(200).send(this.renderHtmlPage('Ошибка при активации аккаунта', false));
            }

            await this.userRepository.save(user.activate());
            return res.status(200).send(this.renderHtmlPage('Аккаунт успешно активирован', true));
        } catch (e: any) {
            return res.status(500).send(this.renderHtmlPage(`Внутренняя ошибка сервера: ${e.message}`, false));
        }
    }

    private renderHtmlPage(message: string, isSuccess: boolean): string {
        const title = isSuccess ? 'Успешная активация' : 'Ошибка активации';
        const color = isSuccess ? 'green' : 'red';
        const clientUrl = process.env.CLIENT_URL;

        return `
            <!DOCTYPE html>
            <html lang="ru">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${title}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        text-align: center;
                        padding: 50px;
                    }
                    h1 {
                        color: ${color};
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                    }
                    .btn {
                        display: inline-block;
                        margin-top: 20px;
                        padding: 10px 20px;
                        background-color: ${isSuccess ? '#4CAF50' : '#f44336'};
                        color: white;
                        text-decoration: none;
                        border-radius: 4px;
                        transition: background-color 0.3s;
                    }
                    .btn:hover {
                        background-color: ${isSuccess ? '#45a049' : '#d32f2f'};
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>${title}</h1>
                    <p>${message}</p>
                    <a href="${clientUrl}/personal" class="btn">Перейти в личный кабинет</a>
                </div>
            </body>
            </html>
            `;
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

        const tokens = await this.tokenService.generateTokens({ ...user });
        await this.tokenService.saveToken(user.id, tokens.refreshToken);

        res.cookie('refreshToken', tokens.refreshToken, {
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
            const { method, creditial } = req.body;
            await this.authService.sendTwoFactorCode(creditial, method);
            return res.status(200).json({});
            return res.status(200).json({});
        } catch (e: any) {
            next(ApiError.badRequest(e.message));
        }
    }

    async checkVarifyCode(req: Request, res: Response, next: NextFunction) {
        try {
            const { code, creditial } = req.body;
            const user = await this.userRepository.findByEmailOrPhone(creditial) as User;

            if (!user) {
                return res.status(404).json({ success: false, message: 'Пользователь не найден' });
                return res.status(404).json({ success: false, message: 'Пользователь не найден' });
            }

            const isCodeValid = await this.authService.verifyTwoFactorCode(user.id, code);
            if (!isCodeValid) {
                return res.status(404).json({ success: false, message: 'Не верный код' });
                return res.status(404).json({ success: false, message: 'Не верный код' });
            }

            return res.status(200).json({ success: true, message: 'Верный код' });
            return res.status(200).json({ success: true, message: 'Верный код' });
        } catch (e: any) {
            next(ApiError.badRequest(e.message));
        }
    }

    async sendLoginNotification(req: Request, res: Response, next: NextFunction) {
        try {
            const { phone, code } = req.body;

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
            const { userId } = req.params;
            if (!userId) {
                return next(ApiError.badRequest('Пользователь не авторизован'));
            }

            const token = await this.authService.generateTelegramLinkToken(Number(userId));

            return res.json({
                success: true,
                token
            });
        } catch (e: any) {
            return next(ApiError.badRequest(e.message));
        }
    }

    async requestPinReset(req: Request, res: Response, next: NextFunction) {
        try {
            const { creditial } = req.body;
            await this.authService.requestPinReset(creditial);
            return res.status(200).json({ success: true, message: 'Сообщение для сброса пин-кода было отправлено' });
        } catch (e: any) {
            return next(ApiError.badRequest(e.message));
        }
    }

    async resetPin(req: Request, res: Response, next: NextFunction) {
        try {
            const { token, newPin } = req.body;
            await this.authService.resetPin(token, newPin);
            return res.json({ success: true, message: 'Пин-код успешно изменен' });
        } catch (e: any) {
            return next(ApiError.badRequest(e.message));
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { data } = req.body;

            const user = await this.userRepository.findById(Number(id));
            if (!user) {
                return next(ApiError.badRequest('Пользователь не найден'));
            }

            const updatedUser = new User(
                user.id,
                'name' in data ? data.name : user.name, 
                'surname' in data ? data.surname : user.surname,
                'patronymic' in data ? data.patronymic : user.patronymic,
                data.email || user.email,
                data.phone || user.phone,
                user.pinCode,
                data.timeZone || user.timeZone,
                data.dateBirth || user.dateBirth,
                data.gender || user.gender,
                user.isActivated,
                user.isActivatedSMS,
                user.activationLink,
                user.img,
                user.role,
                user.twoFactorCode,
                user.twoFactorCodeExpires,
                user.resetToken,
                user.resetTokenExpires,
                user.pinAttempts,
                user.isBlocked,
                user.blockedUntil,
                user.sentChanges
            );


            let imgUser = user.img;
            if (user.img === 'man.png' || user.img === 'girl.png') {
                imgUser = updatedUser.gender === 'Женщина' ? 'girl.png' : 'man.png';
            }
            if (data.img && data.img !== user.img) {
                imgUser = data.img;
            }

            const updatedUserWithAvatar = updatedUser.updateAvatar(imgUser);

            let result;
            if (updatedUserWithAvatar.role === 'DOCTOR') {
                const allowedFields: (keyof User)[] = [
                    'name',
                    'surname',
                    'patronymic',
                    'gender',
                    'dateBirth'
                ];
                const changes = Object.entries(data)
                    .filter(([field_name]) => allowedFields.includes(field_name as keyof User))
                    .map(([field_name, new_value]) => {
                        const field = field_name as keyof User;
                        const oldValue = user[field];
                        const translatedFieldName = FIELD_TRANSLATIONS[field_name] || field_name;
                        
                        return {
                            field_name: translatedFieldName,
                            old_value: oldValue !== undefined && oldValue !== null ? String(oldValue) : null,
                            new_value: String(new_value)
                        };
                    });

                await this.batchRepository.createBatchWithChangesUser(Number(updatedUserWithAvatar.id), changes);
                await this.userRepository.save(user.setSentChanges());
                result = user;
            } else {
                result = await this.userRepository.save(updatedUserWithAvatar);
            }

            if (result) {
                return res.status(200).json({ success: true, message: 'Изменения сохранены', user: result });
            } else {
                return res.status(404).json({ success: false, message: 'Ошибка при сохранении изменений', user: null });
            }
        } catch (e: any) {
            return next(ApiError.internal(e.message));
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            const user = await this.userRepository.findById(Number(id));
            if (!user) {
                return next(ApiError.badRequest('Пользователь не найден'));
            }

            await this.userRepository.delete(Number(id));

            res.status(204).send();
        } catch (error) {
            next(ApiError.internal('Ошибка при удалении пользователя'));
        }
    }

    async unblockAccount(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req.body;

            const user = await this.userRepository.findById(Number(userId));
            if (!user) {
                return next(ApiError.badRequest('Пользователь не найден'));
            }

            await this.authService.unblockAccount(Number(userId));
            return res.status(200).json({ success: true, message: 'Аккаунт успешно разблокирован' });
        } catch (e: any) {
            return next(ApiError.badRequest(e.message));
        }
    }

    async blockAccount(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req.body;
            const user = await this.userRepository.findById(Number(userId));
            if (!user) {
                return next(ApiError.badRequest('Пользователь не найден'));
            }
            await this.authService.blockAccount(Number(userId));
            return res.status(200).json({ success: true, message: 'Аккаунт заблокирован' })
        } catch(e: any) {
            return next(ApiError.badRequest(e.message));
        }
    }

    async sendActivationEmail(req: Request, res: Response, next: NextFunction) {
        try {
            const { email } = req.body;
            const user = await this.userRepository.findByEmail(email);

            if (!user) {
                return res.status(404).json({ success: false, message: 'Пользователь не найден' });
            }
            await this.authService.sendActivationEmail(email, user.activationLink);
            return res.status(200).json({ success: true, message: 'Код отправлен на почту' });
        } catch (e: any) {
            return next(ApiError.badRequest('Ошибка при отправке ссылки активации по почте'));
        }
    }

    async uploadAvatar(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req.body;
            const img = req.files?.img;
            if (!img || Array.isArray(img)) {
                throw new Error('Файл не загружен или загружено несколько файлов');
            }
            const userUpdate = await this.userRepository.uploadAvatar(Number(userId), img);
            console.log("user ", userUpdate);
            return res.status(200).json({
                img: userUpdate.img,
                surname: userUpdate.surname,
                name: userUpdate.name,
                patronymic: userUpdate.patronymic,
                gender: userUpdate.gender,
                dateBirth: userUpdate.dateBirth,
                timeZone: userUpdate.timeZone,
                phone: userUpdate.phone,
                email: userUpdate.email
            });
        } catch (e: any) {
            return next(ApiError.badRequest(e.message));
        }
    }

    async deleteAvatar(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req.body;
            const userDelete = await this.userRepository.deleteAvatar(Number(userId));
            return res.status(200).json({
                img: userDelete.img,
                surname: userDelete.surname,
                name: userDelete.name,
                patronymic: userDelete.patronymic,
                gender: userDelete.gender,
                dateBirth: userDelete.dateBirth,
                timeZone: userDelete.timeZone,
                phone: userDelete.phone,
                email: userDelete.email
            })
        } catch (e: any) {
            return next(ApiError.badRequest(e.message));
        }
    }

    async changeRole(req: Request, res: Response, next: NextFunction) {
        const { userId, newRole } = req.body;
        const user = this.userRepository.findById(Number(userId)) as unknown as User;
        if(!user) {
            return next(ApiError.badRequest('Пользователь не найден'));
        }

        if(newRole !== "PATIENT" && newRole !== "DOCTOR" && newRole !== "ADMIN") {
            return next(ApiError.badRequest('Неизвестная роль'));
        }
        await this.userRepository.save(user.setRole(newRole));
    }
}


const FIELD_TRANSLATIONS: Record<string, string> = {
    name: 'Имя',
    surname: 'Фамилия',
    patronymic: 'Отчество',
    gender: 'Пол',
    dateBirth: 'Дата рождения'
};