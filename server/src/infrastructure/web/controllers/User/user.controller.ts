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
import dataResult from "../../types/dataResultAuth.js";
import DoctorRepository from "../../../../core/domain/repositories/doctor.repository.js";
import Doctor from "../../../../core/domain/entities/doctor.entity.js";
import BasicData from "../../../../core/domain/entities/basicData.entity.js"
import BasicDataRepository from "../../../../core/domain/repositories/basicData.repository.js"
import ConsultationRepository from "../../../../core/domain/repositories/consultation.repository.js"
import NotificationRepository from "../../../../core/domain/repositories/notifaction.repository.js";
import Notification from "../../../../core/domain/entities/notification.entity.js";

export default class UserController {
    constructor(
        private readonly authService: AuthService,
        private readonly userRepository: UserRepository,
        private readonly tokenService: TokenService,
        private readonly fileService: FileService,
        private readonly basicDataRepository: BasicDataRepository,
        private readonly doctorRepository: DoctorRepository,
        private readonly consultationRepository: ConsultationRepository,
        private readonly notificationRepository: NotificationRepository
    ) { }

    async registration(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                email,
                role,
                name,
                surname,
                patronymic,
                phone,
                pin_code: pinCode,
                gender,
                date_birth: dateBirth,
                time_zone: timeZone,
                specializations,
                experienceYears,
                isAnonymous,
            } = req.body;

            const exists = await this.userRepository.checkUserExists(email, phone);
            if (exists) {
                return next(ApiError.badRequest("Пользователь с таким email или телефоном уже существует"));
            }

            const saveFile = async (file?: UploadedFile) => file ? await this.fileService.saveFile(file) : null;

            const diploma = await saveFile(req.files?.diploma as UploadedFile) || "";
            const license = await saveFile(req.files?.license as UploadedFile) || "";

            const data: regData = {
                email,
                role,
                name,
                surname,
                patronymic,
                phone,
                pinCode,
                gender,
                dateBirth,
                timeZone,
                specializations,
                experienceYears,
                diploma,
                license,
                isAnonymous,
            };

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
            const { creditial, pin_code: pinCode, twoFactorCode, twoFactorMethod } = req.body;

            const result: dataResult = await this.authService.login(
                creditial,
                pinCode,
                twoFactorMethod,
                twoFactorCode
            );

            if (result.requiresTwoFactor) {
                return res.json({ success: true, tempToken: result.tempToken });
            }

            res.cookie("refreshToken", result.refreshToken, {
                maxAge: 24 * 60 * 60 * 1000,
                httpOnly: true,
                secure: true,
            });

            return res.json(result);
        } catch (e: any) {
            return next(ApiError.badRequest(e.message));
        }
    }

    async completeTwoFactorAuth(req: Request, res: Response, next: NextFunction) {
        try {
            const { tempToken, code } = req.body;

            const result: dataResult = await this.authService.completeTwoFactorAuth(tempToken, code);

            res.cookie("refreshToken", result.refreshToken, {
                maxAge: 24 * 60 * 60 * 1000,
                httpOnly: true,
                secure: true,
            });

            return res.json(result);
        } catch (e: any) {
            next(ApiError.badRequest(e.message));
        }
    }

    async logout(req: Request, res: Response, next: NextFunction) {
        try {
            const { refreshToken } = req.cookies;

            await this.authService.logout(refreshToken);
            res.clearCookie('refreshToken');

            return res.json({ success: true, message: "Успешный выход" });
        } catch (e: any) {
            next(ApiError.badRequest(e.message))
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

    async check(req: any, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return next(ApiError.internal("Пользователь не авторизован"));
            }

            const tokens = await this.tokenService.generateTokens({ ...req.user });
            return res.status(200).json({ tokens });
        } catch (e: unknown) {
            if (e instanceof Error) {
                return next(ApiError.badRequest(e.message));
            }
            return next(ApiError.badRequest("Неизвестная ошибка"));
        }
    }

    async checkUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { creditial } = req.body;
            const creditialLow = creditial.toLowerCase();
            const user = await this.userRepository.findByEmailOrPhone(creditialLow) as User;
            if (!user) {
                return next(ApiError.badRequest('Такого пользователя не существует'));
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
            const { activationLink, email } = req.query;

            if (!activationLink || !email) {
                return next(ApiError.badRequest("Некорректная ссылка активации или данные почты"));
            }

            const user = await this.userRepository.findByActivationLink(activationLink.toString());
            if (!user) {
                return next(ApiError.badRequest('Пользователь не найден'));
            }

            if (user.isBlocked) {
                return next(ApiError.badRequest('Аккаут заблокирован'));
            }

            await this.userRepository.save(user.activate().updateEmail(email.toString()));

            return res.status(200).send(this.renderHtmlPage("Аккаунт успешно активирован", true));
        } catch (e: any) {
            return next(ApiError.internal(e.message));
        }
    }

    async refresh(req: Request, res: Response, next: NextFunction) {
        try {
            const { refreshToken } = req.cookies;
            if (!refreshToken) {
                return next(ApiError.notAuthorized('Пользователь не авторизован'));
            }
            const userPayload = this.tokenService.validateRefreshToken(refreshToken);

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

            const countNot = await this.notificationRepository.countByUserId(user.id, true);

            const tokens = await this.tokenService.generateTokens({ ...user });
            await this.tokenService.saveToken(user.id, tokens.refreshToken);

            res.cookie('refreshToken', tokens.refreshToken, {
                maxAge: 30 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                secure: true
            });

            return res.json({
                accessToken: tokens.accessToken,
                countMessage: countNot,
                user: user
            });
        } catch (e: any) {
            return next(ApiError.badRequest(e.message));
        }
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

            const user = await this.userRepository.findById(Number(userId));
            if (!user) {
                return next(ApiError.badRequest('Пользователь не найден'));
            }

            const token = await this.authService.generateTelegramLinkToken(Number(userId));
            await this.authService.sendActivationPhone(user.email, token);

            return res.json({
                success: true,
                message: `Сообщение для подключения телефона отправлено на почту ${user.email}`,
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
                return next(ApiError.badRequest("Пользователь не найден"));
            }

            if (data.isAnonymous === false) {
                const requiredFields = ['name', 'surname', 'patronymic', 'dateBirth', 'gender'];
                const missingFields = requiredFields.filter(field =>
                    data[field] === null || data[field] === undefined || data[field] === ''
                );

                if (missingFields.length > 0) {
                    return next(ApiError.badRequest('Не заполнены обязательные поля'));
                }
            }

            const userData = {
                name: data.isAnonymous ? '' : (data.name ?? user.name),
                surname: data.isAnonymous ? '' : (data.surname ?? user.surname),
                patronymic: data.isAnonymous ? '' : (data.patronymic ?? user.patronymic),
                dateBirth: data.isAnonymous ? null : (data.dateBirth ?? user.dateBirth),
                gender: data.isAnonymous ? null : (data.gender ?? user.gender),
                isAnonymous: data.isAnonymous ?? user.isAnonymous,
                email: data.email ?? user.email,
                phone: data.phone ?? user.phone,
                timeZone: data.timeZone ?? user.timeZone,
            };

            const updatedUser = user.cloneWithChanges(userData);

            let avatar: string;
            if (updatedUser.isAnonymous) {
                avatar = updatedUser.gender === "Женщина" ? "girl.png" : "man.png";
            } else {
                if (data.img && data.img !== user.img) {
                    avatar = data.img;
                } else {
                    const isDefaultAvatar = user.img === "man.png" || user.img === "girl.png";
                    if (isDefaultAvatar && updatedUser.gender) {
                        avatar = updatedUser.gender === "Женщина" ? "girl.png" : "man.png";
                    } else {
                        avatar = user.img;
                    }
                }
            }

            const updatedUserWithAvatar = updatedUser.updateAvatar(avatar);

            let result: User;

            if (updatedUserWithAvatar.role === "DOCTOR") {
                const changes = this.collectDoctorChanges(user, data);
                await this.basicDataRepository.createBatchWithChangesUser(
                    Number(updatedUserWithAvatar.id),
                    changes
                );
                await this.userRepository.save(user.setSentChanges(true));
                result = user;
            } else {
                result = await this.userRepository.save(updatedUserWithAvatar);
            }

            return res.status(200).json({
                success: true,
                message: "Изменения сохранены",
                user: result,
            });
        } catch (e: any) {
            return next(ApiError.internal("Неизвестная ошибка"));
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
            return next(ApiError.internal('Ошибка при удалении пользователя'));
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
        } catch (e: any) {
            return next(ApiError.badRequest(e.message));
        }
    }

    async sendActivationEmail(req: Request, res: Response, next: NextFunction) {
        try {
            const { email } = req.body;
            const user = await this.userRepository.findByEmail(email);

            if (!user) {
                return next(ApiError.badRequest(`Пользователь с почтой "${email}" уже существует`))
            }

            await this.authService.sendActivationEmail(email, user.activationLink);
            return res.status(200).json({ success: true, message: 'Инструкция отправлена на почту' });
        } catch (e: any) {
            return next(ApiError.internal(e.message));
        }
    }

    async uploadAvatar(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { userId } = req.body;
            const img = req.files?.img;

            const user = await this.userRepository.findById(Number(userId));
            if (!user) {
                return next(ApiError.badRequest('Пользователь не найден'));
            }

            if (!img) {
                return next(ApiError.badRequest('Файл не загружен'));
            }

            if (Array.isArray(img)) {
                return next(ApiError.badRequest('Загружено несколько файлов'));
            }

            let updatedUser: User;
            const fileName = await this.fileService.saveFile(img);
            if (user.role === 'DOCTOR') {
                if (user.img && user.img !== 'man.png' && user.img !== 'girl.png') {
                    await this.fileService.deleteFile(user.img);
                }

                updatedUser = await this.userRepository.save(user.updateAvatar(fileName).setSentChanges(true));
                const basicData = new BasicData(0, 'pending', ' ', false, 'Изображение', user.img, updatedUser.img, updatedUser.id);
                await this.basicDataRepository.create(basicData);
            } else {
                if (user.img && user.img !== 'man.png' && user.img !== 'girl.png') {
                    await this.fileService.deleteFile(user.img);
                }
                updatedUser = await this.userRepository.save(user.updateAvatar(fileName));
            }

            const result = {
                img: updatedUser.img,
                surname: updatedUser.surname,
                name: updatedUser.name,
                patronymic: updatedUser.patronymic,
                gender: updatedUser.gender,
                dateBirth: updatedUser.dateBirth,
                timeZone: updatedUser.timeZone,
                phone: updatedUser.phone,
                email: updatedUser.email
            };

            res.status(200).json(result);
        } catch (e: any) {
            return next(ApiError.internal(e.message));
        }
    }

    async deleteAvatar(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req.body;

            const user = await this.userRepository.findById(Number(userId));
            if (!user) {
                return next(ApiError.badRequest('Пользователь не найден'));
            }

            if (user.img && user.img !== 'man.png' && user.img !== 'girl.png') {
                await this.fileService.deleteFile(user.img);
            }

            const defaultAvatar = user.gender === 'Женщина' ? 'girl.png' : 'man.png';
            const updatedUser = await this.userRepository.save(user.updateAvatar(defaultAvatar));

            return res.status(200).json({
                img: updatedUser.img,
                surname: updatedUser.surname,
                name: updatedUser.name,
                patronymic: updatedUser.patronymic,
                gender: updatedUser.gender,
                dateBirth: updatedUser.dateBirth,
                timeZone: updatedUser.timeZone,
                phone: updatedUser.phone,
                email: updatedUser.email
            })
        } catch (e: any) {
            return next(ApiError.badRequest(e.message));
        }
    }

    async changeRole(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId, newRole } = req.body;
            const user = await this.userRepository.findById(Number(userId));
            if (!user) {
                return next(ApiError.badRequest('Пользователь не найден'));
            }

            if (newRole !== "PATIENT" && newRole !== "DOCTOR" && newRole !== "ADMIN") {
                return next(ApiError.badRequest('Неизвестная роль'));
            }

            if (newRole === 'DOCTOR') {
                const doctor = await this.doctorRepository.save(new Doctor(0, true, [], user.id));
                if (!doctor) {
                    return next(ApiError.internal('Ошибка изменения роли пользователя на специалиста'));
                }
            }

            await this.userRepository.save(user.setRole(newRole));
            await this.notificationRepository.save(new Notification(0, "Изменение роли", `Вы теперь стали специалистом на платоформе, загрузите пожалуйста свои данные о специализации(ях) в личном кабинете!`, "WARNING", false, null, "CHANGEROLE", user.id));

            return res.status(200).json({ success: true, message: `Роль пользователя была изменена на ${newRole}` });
        } catch (e: any) {
            return next(ApiError.badRequest(e.message));
        }
    }

    async getRecomendation(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId, page, limit } = req.query;

            const pageRec = page ? page : 1;
            const limitRec = limit ? limit : 1;

            const user = await this.userRepository.findById(Number(userId));
            if (!user) {
                return next(ApiError.badRequest('Пользователь не найден'));
            }

            const consultations = await this.consultationRepository.findByUserId(user.id, Number(pageRec), Number(limitRec));
            if (consultations && consultations.length === 0) {
                return next(ApiError.badRequest('Консультации для пользователя не найдены'));
            }

            res.status(200).json(consultations.map(consult => ({
                doctorName: consult.doctor?.user.name,
                doctorSurname: consult.doctor?.user.surname,
                doctorPatronymic: consult.doctor?.user.patronymic,
                date: consult.date,
                time: consult.time,
                recomendation: consult.recommendations,
                specialization: consult.doctor?.profData.map(p => p.specialization)
            })));
        } catch (e: any) {
            return next(ApiError.internal(e.message));
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

    private collectDoctorChanges(user: User, data: Partial<User>) {
        const allowedFields: (keyof User)[] = [
            "name",
            "surname",
            "patronymic",
            "gender",
            "dateBirth",
        ];

        return Object.entries(data)
            .filter(([field]) => allowedFields.includes(field as keyof User))
            .map(([field, newValue]) => {
                const oldValue = user[field as keyof User];
                const translatedFieldName = FIELD_TRANSLATIONS[field] || field;

                return {
                    field_name: translatedFieldName,
                    old_value:
                        oldValue !== undefined && oldValue !== null
                            ? String(oldValue)
                            : null,
                    new_value: String(newValue),
                };
            });
    }
}

const FIELD_TRANSLATIONS: Record<string, string> = {
    name: 'Имя',
    surname: 'Фамилия',
    patronymic: 'Отчество',
    gender: 'Пол',
    dateBirth: 'Дата рождения'
};