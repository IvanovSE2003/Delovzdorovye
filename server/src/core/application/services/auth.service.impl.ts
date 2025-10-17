import AuthService from "../../domain/services/auth.service.js";
import UserRepository from "../../domain/repositories/user.repository.js";
import TokenService from "../../domain/services/token.service.js";
import DoctorRepository from "../../domain/repositories/doctor.repository.js";
import MailService from "../../domain/services/mail.service.js";
import SmsService from "../../domain/services/sms.service.js";
import TelegramService from "../../domain/services/telegram.service.js";
import User from "../../domain/entities/user.entity.js";
import { v4 } from "uuid";
import TwoFactorService from "../../domain/services/twoFactor.service.js";
import jwt from 'jsonwebtoken'
import regData from "../../../infrastructure/web/types/reqData.type.js";
import SpecializationRepository from "../../domain/repositories/specializations.repository.js";
import dataResult from "../../../infrastructure/web/types/dataResultAuth.js";

export class AuthServiceImpl implements AuthService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly doctorRepository: DoctorRepository,
        private readonly tokenService: TokenService,
        private readonly mailService: MailService,
        private readonly smsService: SmsService,
        private readonly twoFactorService: TwoFactorService,
        private readonly telegramService: TelegramService,
        private readonly specializationRepository: SpecializationRepository
    ) { }

    async register(data: regData): Promise<{ user: User; accessToken: string; refreshToken: string }> {
        const activationLink = v4();

        const baseUserData = {
            email: (data.email).toLowerCase(),
            phone: data.phone,
            pinCode: data.pinCode,
            timeZone: data.timeZone,
            dateBirth: data.dateBirth,
            gender: data.gender,
            isActivated: false,
            isBanned: false,
            activationLink,
            avatar: data.gender ? data.gender === "Женщина" ? "girl.png" : "man.png" : "man.png",
            role: "PATIENT",
            isAnonymous: data.isAnonymous,
        };

        let user;
        if (baseUserData.isAnonymous) {
            user = new User(
                0,
                "",
                "",
                "",
                baseUserData.email,
                baseUserData.phone,
                baseUserData.pinCode,
                baseUserData.timeZone,
                null,
                null,
                baseUserData.avatar,
                "",
                "",
                "",
                null,
                null,
                false,
                baseUserData.isActivated,
                baseUserData.isBanned,
                baseUserData.activationLink,
                baseUserData.avatar,
                "PATIENT",
                null,
                null,
                null,
                null,
                0,
                false,
                null,
                false,
                baseUserData.isAnonymous
            );
        } else {
            user = new User(
                0,
                data.name,
                data.surname,
                data.patronymic,
                baseUserData.email,
                baseUserData.phone,
                baseUserData.pinCode,
                baseUserData.timeZone,
                baseUserData.dateBirth,
                baseUserData.gender,
                baseUserData.avatar,
                data.name,
                data.surname,
                data.patronymic,
                baseUserData.dateBirth,
                baseUserData.gender,
                false,
                baseUserData.isActivated,
                baseUserData.isBanned,
                baseUserData.activationLink,
                baseUserData.avatar,
                "PATIENT",
                null,
                null,
                null,
                null,
                0,
                false,
                null,
                false,
                baseUserData.isAnonymous
            );
        }

        const savedUser = await this.userRepository.save(user);
        const tokens = await this.tokenService.generateTokens({
            id: savedUser.id,
            email: savedUser.email,
            role: savedUser.role,
        });

        await this.tokenService.saveToken(savedUser.id, tokens.refreshToken);

        return {
            user: savedUser,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        };
    }

    async registerWithTwoFactor(data: regData): Promise<{ requiresTwoFactor: boolean; tempToken: string }> {
        const code = this.twoFactorService.generateCode();
        const expires = new Date(Date.now() + 5 * 60 * 1000);

        await this.mailService.sendTwoFactorCode(data.email, code);

        const tempToken = jwt.sign(
            {
                data,
                code,
                expires,
                twoFactorRequired: true,
                action: "registration",
            },
            this.twoFactorService.getTempSecret(),
            { expiresIn: "5m" }
        );

        return { requiresTwoFactor: true, tempToken };
    }

    async completeRegistration(tempToken: string, code: string) {
        const payload = jwt.verify(tempToken, this.twoFactorService.getTempSecret()) as jwt.JwtPayload & {
            data: regData;
            code: string;
            expires: string;
            action: string;
        };

        if (payload.action !== "registration") throw new Error("Неверный временный токен");

        if (payload.code !== code) {
            throw new Error("Неверный код подтверждения");
        }

        const user = await this.register(payload.data);

        const tokens = await this.tokenService.generateTokens({
            id: user.user.id,
            email: user.user.email,
            role: user.user.role,
        });

        await this.tokenService.saveToken(user.user.id, tokens.refreshToken);

        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: user.user,
        };
    }

    async logout(refreshToken: string): Promise<void> {
        if (!refreshToken) {
            throw new Error("Токен не найден");
        }

        const tokenData = this.tokenService.validateRefreshToken(refreshToken);
        if (!tokenData) {
            throw new Error("Не валидный токен");
        }

        await this.tokenService.removeToken(refreshToken);
    }

    async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string; }> {
        if (!refreshToken) {
            throw new Error("Токен не найден");
        }

        const userData = await this.tokenService.validateRefreshToken(refreshToken);
        if (!userData) {
            throw new Error("Не валидный токен");
        }

        const tokenFromDb = await this.tokenService.findToken(refreshToken);
        if (!tokenFromDb) {
            throw new Error("Токен не найден в базе данных");
        }

        const user = await this.userRepository.findById(userData.id);
        if (!user) {
            throw new Error('Пользователь не найден');
        }

        await this.tokenService.removeToken(refreshToken);

        const tokens = await this.tokenService.generateTokens({
            id: user.id,
            email: user.email,
            role: user.role
        });

        await this.tokenService.saveToken(user.id, tokens.refreshToken);

        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        };
    }

    async generateTelegramLinkToken(userId: number): Promise<string> {
        return await this.telegramService.generateLinkToken(userId);
    }

    async login(
        user: User,
        pinCode: number,
        twoFactorMethod?: string,
        twoFactorCode?: string,
        tempToken?: string
    ): Promise<dataResult> {
        const isPinValid = await this.userRepository.verifyPinCode(user.id, pinCode);
        if (!isPinValid) {
            const updatedUser = user.incrementPinAttempts();
            await this.userRepository.save(updatedUser);

            if (updatedUser.pinAttempts >= 3) {
                const blockedUser = updatedUser.blockAccount();
                await this.userRepository.save(blockedUser);
                throw new Error("Превышено количество попыток. Аккаунт заблокирован на 30 минут.");
            }

            const attemptsLeft = 3 - updatedUser.pinAttempts;
            throw new Error(`Неверный пин-код. Осталось попыток: ${attemptsLeft}`);
        }

        const resetUser = await this.userRepository.save(user.resetPinAttempts());

        if (twoFactorCode) {
            if (!tempToken) {
                throw new Error('Отсутствует временный токен');
            }

            let payload;
            try {
                payload = jwt.verify(tempToken, this.twoFactorService.getTempSecret()) as jwt.JwtPayload & {
                    id: number;
                    email: string;
                    role: string;
                    twoFactorRequired: boolean;
                };
            } catch (e) {
                throw new Error('Временный токен невалиден или просрочен');
            }

            if (payload.id !== user.id) {
                throw new Error('Несоответствие токена и пользователя');
            }

            const isValid = await this.twoFactorService.verifyCode(user, twoFactorCode);
            if (!isValid) throw new Error('Неверный код подтверждения');

            const tokens = await this.tokenService.generateTokens({
                id: user.id,
                email: user.email,
                role: user.role
            });

            await this.tokenService.saveToken(user.id, tokens.refreshToken);

            if (user.isActivatedSMS) {
                await this.smsService.sendLoginNotification(user.id);
            }

            return {
                user: resetUser,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken
            };
        }

        const code = this.twoFactorService.generateCode();
        const expires = new Date(Date.now() + 5 * 60 * 1000);

        await this.userRepository.save(user.setTwoFactorCode(code, expires));

        if (twoFactorMethod === "SMS" && !user.isActivatedSMS) {
            twoFactorMethod = 'EMAIL';
        }

        if (twoFactorMethod) {
            await this.twoFactorService.sendCode(user, twoFactorMethod, code);
        } else {
            await this.mailService.sendTwoFactorCode(user.email, code);
        }

        const newTempToken = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
                twoFactorRequired: true
            },
            this.twoFactorService.getTempSecret(),
            { expiresIn: '5m' }
        );

        return {
            user: resetUser,
            accessToken: '',
            refreshToken: '',
            requiresTwoFactor: true,
            tempToken: newTempToken
        };
    }

    async sendTwoFactorCode(creditial: string, method: string): Promise<void> {
        const user = await this.userRepository.findByEmailOrPhone(creditial) as User;
        if (user) {
            if (user.isBlocked) {
                throw new Error("Аккаунт заблокирован");
            }
            const code = this.twoFactorService.generateCode();
            const expires = new Date(Date.now() + 5 * 60 * 1000);
            await this.userRepository.save(user.setTwoFactorCode(code, expires));
            await this.twoFactorService.sendCode(user, method, code);
        }
    }

    async completeTwoFactorAuth(tempToken: string, code: string): Promise<{ accessToken: string; refreshToken: string; user: User; }> {
        try {
            const userData = jwt.verify(tempToken, this.twoFactorService.getTempSecret()) as jwt.JwtPayload & {
                id: number;
                email: string;
                role: string;
                twoFactorRequired: boolean;
            };

            if (!userData.twoFactorRequired) {
                throw new Error('Неверный временный токен');
            }

            const user = await this.userRepository.findById(userData.id);
            if (!user) {
                throw new Error('Пользователь не найден');
            }

            const isValid = await this.twoFactorService.verifyCode(user, code);
            if (!isValid) {
                throw new Error('Неверный код подтверждения');
            }

            const tokens = await this.tokenService.generateTokens({
                id: user.id,
                email: user.email,
                role: user.role,
            });

            await this.tokenService.saveToken(user.id, tokens.refreshToken);

            if (user.isActivatedSMS) {
                await this.smsService.sendLoginNotification(user.id);
            }

            await this.userRepository.save(user.clearTwoFactorCode());

            return {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                user: user
            };

        } catch (error: any) {
            if (error.name === 'TokenExpiredError') {
                throw new Error('Код просрочен');
            } else if (error.name === 'JsonWebTokenError') {
                throw new Error('Неверный код');
            }
            throw error;
        }
    }

    async sendLoginNotification(phone: string, code: string): Promise<void> {
        const user = await this.userRepository.findByPhone(phone) as unknown as User;
        if (!user) {
            throw new Error('Пользователь не найден');
        }

        if (user.twoFactorCode !== code) {
            throw new Error('Код не верный')
        }
    }

    async requestPinReset(emailOrPhone: string): Promise<void> {
        const userByPhone = await this.userRepository.findByPhone(emailOrPhone);
        const userByEmail = await this.userRepository.findByEmail(emailOrPhone);

        let method: "SMS" | "EMAIL" | null = null;
        let user: User | null = null;

        if (userByPhone) {
            method = "SMS";
            user = userByPhone as User;
        } else if (userByEmail) {
            method = "EMAIL";
            user = userByEmail as User;
        }

        if (!user || !method) {
            throw new Error("Пользователь не найден");
        }

        const resetToken = v4();
        const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);

        const updatedUser = user.setResetToken(resetToken, resetTokenExpires, user.pinCode);
        await this.userRepository.save(updatedUser);

        if (method === "EMAIL") {
            await this.mailService.sendPinCodeResetEmail(user.email, resetToken);
        } else {
            await this.smsService.sendPinCodeResetEmail(user.phone, resetToken);
        }
    }

    async resetPin(resetToken: string, newPin: number): Promise<void> {
        const user = await this.userRepository.findByResetToken(resetToken) as User;
        if (!user || !user.resetTokenExpires || new Date() > user.resetTokenExpires) {
            throw new Error("Недействительный или просроченный токен");
        }

        this.unblockAccount(user.id);

        const updatedUser = user.setResetToken(null, null, newPin).resetPinAttempts().unblockAccount();
        await this.userRepository.save(updatedUser);
    }

    async unblockAccount(userId: number): Promise<void> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error("Пользователь не найден");
        }

        if (!user.isBlocked) {
            throw new Error("Аккаунт не заблокирован");
        }

        const updatedUser = user.unblockAccount();
        await this.userRepository.save(updatedUser);
    }

    async blockAccount(userId: number): Promise<void> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error("Пользователь не найден");
        }

        if (user.isBlocked) {
            throw new Error("Аккаунт уже заблокирован");
        }

        const updatedUser = user.blockAccount();
        await this.userRepository.save(updatedUser);
    }

    async sendActivationEmail(email: string, activationLink: string) {
        await this.mailService.sendActivationEmail(email, activationLink);
    }

    async sendActivationPhone(email: string, token: string): Promise<void> {
        await this.mailService.sendActivationPhone(email, token);
    }
}