import { Request, Response, NextFunction } from "express";
import AuthService from "../../../../core/domain/services/auth.service.js";
import UserRepository from "../../../../core/domain/repositories/user.repository.js";
import ApiError from "../../error/ApiError.js"
import TokenService from "../../../../core/domain/services/token.service.js";
import User from "../../../../core/domain/entities/user.entity.js";
import regData from "../../types/reqData.type.js";
import FileService from "../../../../core/domain/services/file.service.js";
import dataResult from "../../types/dataResultAuth.js";
import DoctorRepository from "../../../../core/domain/repositories/doctor.repository.js";
import Doctor from "../../../../core/domain/entities/doctor.entity.js";
import BasicData from "../../../../core/domain/entities/basicData.entity.js"
import BasicDataRepository from "../../../../core/domain/repositories/basicData.repository.js"
import ConsultationRepository from "../../../../core/domain/repositories/consultation.repository.js"
import NotificationRepository from "../../../../core/domain/repositories/notifaction.repository.js";
import Notification from "../../../../core/domain/entities/notification.entity.js";
import { convertMoscowToUserTime } from "../../function/transferTime.js";
import { access } from "fs";

export default class UserController {
    constructor(
        private readonly authService: AuthService,
        private readonly userRepository: UserRepository,
        private readonly tokenService: TokenService,
        private readonly fileService: FileService,
        private readonly basicDataRepository: BasicDataRepository,
        private readonly doctorRepository: DoctorRepository,
        private readonly consultationRepository: ConsultationRepository,
        private readonly notificationRepository: NotificationRepository,
    ) { }

    async registration(req: Request, res: Response, next: NextFunction) {
        const { email, name, surname, patronymic, phone, pinCode, gender, dateBirth, timeZone, isAnonymous, } = req.body;

        const exists = await this.userRepository.checkUserExists(email, phone);
        if (exists) return next(ApiError.badRequest("Пользователь с таким email или телефоном уже существует"));

        const data: regData = { email, name, surname, patronymic, phone, pinCode, gender, dateBirth, timeZone, isAnonymous };
        const result = await this.authService.registerWithTwoFactor(data);

        return res.status(200).json(result);
    }

    async completeRegistration(req: Request, res: Response, next: NextFunction) {
        const { tempToken, twoFactorCode } = req.body;

        const result = await this.authService.completeRegistration(tempToken, twoFactorCode);

        res.cookie("refreshToken", result.refreshToken, {
            maxAge: 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: true,
        });

        return res.status(201).json({
            accessToken: result.accessToken,
            user: {
                name: result.user.name,
                surname: result.user.surname,
                patronymic: result.user.patronymic,
                gender: result.user.gender,
                dateBirth: result.user.dateBirth,
                phone: result.user.phone,
                email: result.user.email,
                timeZone: result.user.timeZone
            },
        });
    }

    async login(req: Request, res: Response, next: NextFunction) {
        const { creditial, pinCode, twoFactorCode, twoFactorMethod } = req.body;
        const result: dataResult = await this.authService.login(
            creditial,
            pinCode,
            twoFactorMethod,
            twoFactorCode
        );

        return res.status(200).json({
            success: true,
            requiresTwoFactor: true,
            tempToken: result.tempToken
        });
    }

    async completeLogin(req: Request, res: Response, next: NextFunction) {
        const { tempToken, code } = req.body;
        const result: dataResult = await this.authService.completeTwoFactorAuth(tempToken, code);

        this.setRefreshTokenCookie(res, result.refreshToken);

        return res.status(200).json({
            success: true,
            accessToken: result.accessToken,
            user: result.user
        });
    }

    private setRefreshTokenCookie(res: Response, refreshToken: string) {
        res.cookie("refreshToken", refreshToken, {
            maxAge: 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: true,
            sameSite: 'strict'
        });
    }

    async logout(req: Request, res: Response, next: NextFunction) {
        const { refreshToken } = req.cookies;
        await this.authService.logout(refreshToken);
        res.clearCookie('refreshToken');
        return res.status(200).json({ success: true, message: "Успешный выход" });
    }

    async getOne(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;

        const user = await this.userRepository.findById(Number(id));
        if (!user) return next(ApiError.badRequest('Пользователь не найден'));

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
    }

    async check(req: any, res: Response, next: NextFunction) {
        if (!req.user) return next(ApiError.internal("Пользователь не авторизован"));
        const tokens = await this.tokenService.generateTokens({ ...req.user });
        return res.status(200).json({ tokens });
    }

    async checkUser(req: Request, res: Response, next: NextFunction) {
        const { creditial } = req.body;

        const user = await this.userRepository.findByEmailOrPhone(creditial.toLowerCase());
        if (!user) return next(ApiError.badRequest('Такого пользователя не существует'));

        return res.status(200).json({
            success: true,
            message: 'Пользователь существует'
        });
    }

    async activate(req: Request, res: Response, next: NextFunction) {
        const { activationLink, email } = req.query;

        if (!activationLink || !email) return next(ApiError.badRequest("Некорректная ссылка активации или данные почты"));

        const user = await this.userRepository.findByActivationLink(activationLink.toString());
        if (!user) return next(ApiError.badRequest('Пользователь не найден'));

        if (user.isBlocked) return next(ApiError.badRequest('Аккаут заблокирован'));
        await this.userRepository.save(user.activate().updateEmail(email.toString()));

        return res.status(200).send(this.renderHtmlPage("Аккаунт успешно активирован", true));
    }

    async refresh(req: Request, res: Response, next: NextFunction) {
        try {
            const { refreshToken } = req.cookies;

            if (!refreshToken) {
                return next(ApiError.notAuthorized('Пользователь не авторизован'));
            }

            const userData = this.tokenService.validateRefreshToken(refreshToken);
            if (!userData || userData.type !== 'refresh') {
                return next(ApiError.notAuthorized('Недействительный токен'));
            }

            const tokenFromDb = await this.tokenService.findToken(refreshToken);
            if (!tokenFromDb) {
                return next(ApiError.notAuthorized('Токен не найден в базе данных'));
            }

            const user = await this.userRepository.findById(userData.id);
            if (!user) {
                return next(ApiError.notAuthorized('Пользователь не найден'));
            }

            if (user.isBlocked) {
                return next(ApiError.notAuthorized('Аккаунт заблокирован'));
            }

            const countMessage = await this.notificationRepository.countByUserId(user.id, true);
            const tokens = await this.tokenService.generateTokens({ ...user });

            await this.tokenService.removeToken(refreshToken);
            await this.tokenService.saveToken(user.id, tokens.refreshToken);

            res.cookie("refreshToken", tokens.refreshToken, {
                maxAge: 24 * 60 * 60 * 1000,
                httpOnly: true,
                secure: true,
                sameSite: 'strict'
            });

            return res.status(200).json({
                accessToken: tokens.accessToken,
                countMessage: countMessage,
                user: user
            });
        } catch (error) {
            return next(ApiError.internal('Ошибка при обновлении токена'));
        }
    }

    async verifyTwoFactor(req: Request, res: Response, next: NextFunction) {
        const { tempToken, code } = req.body;

        if (!tempToken || !code) return next(ApiError.badRequest('Необходимы временный токен и код подтверждения'));
        const tokens = await this.authService.completeTwoFactorAuth(tempToken, code);

        res.cookie("refreshToken", tokens.refreshToken, {
            maxAge: 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: true,
        });

        return res.json({ accessToken: tokens.accessToken });
    }

    async sendTwoFactor(req: Request, res: Response, next: NextFunction) {
        const { method, creditial } = req.body;
        await this.authService.sendTwoFactorCode(creditial, method);
        return res.status(200).json({ success: true, message: 'Код отправлен' });
    }

    async sendLoginNotification(req: Request, res: Response, next: NextFunction) {
        const { phone, code } = req.body;
        await this.authService.sendLoginNotification(phone, code);
        return res.status(200).json({ success: true, message: 'Уведомление отправлено' });
    }

    async linkTelegram(req: Request, res: Response, next: NextFunction) {
        const { userId } = req.params;

        const user = await this.userRepository.findById(Number(userId));
        if (!user) return next(ApiError.badRequest('Пользователь не найден'));

        const token = await this.authService.generateTelegramLinkToken(Number(userId));
        await this.authService.sendActivationPhone(user.email, token);

        return res.json({
            success: true,
            message: `Сообщение для подключения телефона отправлено на почту ${user.email}`,
            token
        });
    }

    async requestPinReset(req: Request, res: Response, next: NextFunction) {
        const { creditial } = req.body;
        await this.authService.requestPinReset(creditial);
        return res.status(200).json({ success: true, message: 'Сообщение для сброса пин-кода было отправлено' });
    }

    async resetPin(req: Request, res: Response, next: NextFunction) {
        const { token, newPin } = req.body;
        await this.authService.resetPin(token, newPin);
        return res.json({ success: true, message: 'Пин-код успешно изменен' });
    }

    async update(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;
        const { data } = req.body;

        const user = await this.userRepository.findById(Number(id));
        if (!user) return next(ApiError.badRequest("Пользователь не найден"));

        if (data.isAnonymous === false) {
            const requiredFields = ['name', 'surname', 'patronymic', 'dateBirth', 'gender'];
            const missingFields = requiredFields.filter(field =>
                data[field] === null || data[field] === undefined || data[field] === ''
            );

            if (missingFields.length > 0) return next(ApiError.badRequest('Не заполнены обязательные поля'));
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
            if (data.img && data.img !== user.img) avatar = data.img;
            else {
                const isDefaultAvatar = user.img === "man.png" || user.img === "girl.png";
                if (isDefaultAvatar && updatedUser.gender) avatar = updatedUser.gender === "Женщина" ? "girl.png" : "man.png";
                else avatar = user.img;
            }
        }

        const updatedUserWithAvatar = updatedUser.updateAvatar(avatar);
        let result: User;

        if (updatedUserWithAvatar.role === "DOCTOR") {
            const changes = this.collectDoctorChanges(user, data);
            await this.basicDataRepository.createBatchWithChangesUser(Number(updatedUserWithAvatar.id), changes);
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
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;

        const user = await this.userRepository.findById(Number(id));
        if (!user) return next(ApiError.badRequest('Пользователь не найден'));

        await this.userRepository.delete(Number(id));

        res.status(204).send();
    }

    async unblockAccount(req: Request, res: Response, next: NextFunction) {
        const { userId } = req.body;

        const user = await this.userRepository.findById(Number(userId));
        if (!user) return next(ApiError.badRequest('Пользователь не найден'));

        await this.authService.unblockAccount(Number(userId));
        return res.status(200).json({
            success: true,
            message: 'Аккаунт успешно разблокирован'
        });
    }

    async blockAccount(req: Request, res: Response, next: NextFunction) {
        const { userId } = req.body;

        const user = await this.userRepository.findById(Number(userId));
        if (!user) return next(ApiError.badRequest('Пользователь не найден'));
        await this.authService.blockAccount(Number(userId));

        return res.status(200).json({
            success: true,
            message: 'Аккаунт заблокирован'
        })
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
        const { userId } = req.body;
        const img = req.files?.img;

        const user = await this.userRepository.findById(Number(userId));
        if (!user) return next(ApiError.badRequest('Пользователь не найден'));
        if (!img) return next(ApiError.badRequest('Файл не загружен'));
        if (Array.isArray(img)) return next(ApiError.badRequest('Загружено несколько файлов'));

        let updatedUser: User;
        const fileName = await this.fileService.saveFile(img);
        if (user.role === 'DOCTOR') {
            updatedUser = await this.userRepository.save(user.setSentChanges(true));
            const basicData = new BasicData(0, 'pending', ' ', false, 'Изображение', user.img, fileName, updatedUser.id);
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
    }

    async deleteAvatar(req: Request, res: Response, next: NextFunction) {
        const { userId } = req.body;

        const user = await this.userRepository.findById(Number(userId));
        if (!user) return next(ApiError.badRequest('Пользователь не найден'));
        if (user.img && user.img !== 'man.png' && user.img !== 'girl.png') await this.fileService.deleteFile(user.img);

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
    }

    async changeRole(req: Request, res: Response, next: NextFunction) {
        const { userId, newRole } = req.body;
        const user = await this.userRepository.findById(Number(userId));

        if (!user) return next(ApiError.badRequest('Пользователь не найден'));
        if (newRole !== "PATIENT" && newRole !== "DOCTOR" && newRole !== "ADMIN") {
            return next(ApiError.badRequest('Неизвестная роль'));
        }

        if (newRole === 'DOCTOR') {
            const doctor = await this.doctorRepository.findByUserIdSimple(user.id);
            if (!doctor) {
                await this.doctorRepository.save(new Doctor(0, true, [], user.id));
            } else {
                await this.doctorRepository.updateSimple(doctor.activate());
            }
        } else if (newRole === 'PATIENT') {
            const doctor = await this.doctorRepository.findByUserIdSimple(user.id);
            if (!doctor) return next(ApiError.badRequest('Специалист не найден'));

            doctor.isActivated = false;
            await this.doctorRepository.updateSimple(doctor);
        }

        await this.userRepository.save(user.setRole(newRole));

        if (newRole === 'DOCTOR') {
            await this.notificationRepository.save(
                new Notification(
                    0,
                    "Изменение роли",
                    `Вы теперь стали специалистом на платоформе, загрузите пожалуйста свои данные о специализации(ях) в личном кабинете!`,
                    "WARNING",
                    false,
                    null,
                    "CHANGEROLE",
                    user.id
                )
            );
        }

        return res.status(200).json({
            success: true,
            message: `Роль была успешно изменена`
        });
    }

    async getRecomendation(req: Request, res: Response, next: NextFunction) {
        const { userId, page, limit } = req.query;

        const pageRec = page ? page : 1;
        const limitRec = limit ? limit : 1;

        const user = await this.userRepository.findById(Number(userId));
        if (!user) return next(ApiError.badRequest('Пользователь не найден'));

        const consultations = await this.consultationRepository.findByUserId(user.id, Number(pageRec), Number(limitRec));
        if (consultations && consultations.length === 0) return next(ApiError.badRequest('Консультации для пользователя не найдены'));

        res.status(200).json(
            consultations.map(consult => {
                const result = convertMoscowToUserTime(consult.date, consult.time, user.timeZone);
                return {
                    doctorName: consult.doctor?.user.name,
                    doctorSurname: consult.doctor?.user.surname,
                    doctorPatronymic: consult.doctor?.user.patronymic,
                    date: result.newDate,
                    time: result.newTime,
                    recomendation: consult.recommendations,
                    specialization: consult.doctor?.profData.map(p => p.specialization)
                };
            })
        );
    }

    private renderHtmlPage(message: string, isSuccess: boolean): string {
        const title = isSuccess ? 'Успешная активация' : 'Ошибка активации';
        const color = isSuccess ? 'green' : 'red';
        const clientUrl = process.env.CLIENT_URL_CLOUD;

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