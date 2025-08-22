import AuthService from "../../domain/services/auth.service.js";
import UserRepository from "../../domain/repositories/user.repository.js";
import TokenService from "../../domain/services/token.service.js";
import PatientRepository from "../../domain/repositories/patient.repository.js";
import DoctorRepository from "../../domain/repositories/doctor.repository.js";
import MailService from "../../domain/services/mail.service.js";
import SmsService from "../../domain/services/sms.service.js";
import TelegramService from "../../domain/services/telegram.service.js";
import User from "../../domain/entities/user.entity.js";
import Patient from "../../domain/entities/patient.entity.js";
import Doctor from "../../domain/entities/doctor.entity.js";
import { v4 } from "uuid";
import TwoFactorService from "../../domain/services/twoFactor.service.js";
import jwt from 'jsonwebtoken'
import regData from "../../../infrastructure/web/types/reqData.type.js";
import SpecializationRepository from "../../domain/repositories/specializations.repository.js";
import models from "../../../infrastructure/persostence/models/models.js";

export class AuthServiceImpl implements AuthService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly patientRepository: PatientRepository,
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
        const defaultImg = data.gender === "Женщина" ? "girl.png" : "man.png";

        const baseUserData = {
            id: 0,
            email: data.email,
            phone: data.phone,
            pinCode: data.pinCode,
            timeZone: data.timeZone,
            dateBirth: data.dateBirth,
            gender: data.gender,
            isActivated: false,
            isBanned: false,
            activationLink,
            avatar: defaultImg,
            role: data.role,
            isAnonymous: data.isAnonymous,
        };

        const user = new User(
            baseUserData.id,
            data.isAnonymous ? "" : data.name,
            data.isAnonymous ? "" : data.surname,
            data.isAnonymous ? "" : data.patronymic,
            baseUserData.email,
            baseUserData.phone,
            baseUserData.pinCode,
            baseUserData.timeZone,
            baseUserData.dateBirth,
            baseUserData.gender,
            baseUserData.isActivated,
            baseUserData.isBanned,
            baseUserData.activationLink,
            baseUserData.avatar,
            baseUserData.role,
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

        const savedUser = await this.userRepository.save(user);

        switch (data.role) {
            case "PATIENT":
                await this.patientRepository.create(
                    new Patient(0, false, savedUser.id, {
                        chronicDiseases: [{ name: "" }],
                        surgeries: [{ year: new Date().getFullYear(), description: "" }],
                        allergies: [{ type: "", description: "" }],
                        medications: [{ name: "", dosage: "" }],
                        analyses: [{ name: "", file: "" }],
                        examinations: [{ name: "", file: "" }],
                        hereditaryDiseases: [{ name: "" }],
                    })
                );
                break;

            case "DOCTOR":
                let specializations: string[] = [];
                if (typeof data.specializations === "string") {
                    try {
                        specializations = JSON.parse(data.specializations);
                    } catch {
                        specializations = [data.specializations];
                    }
                } else if (Array.isArray(data.specializations)) {
                    specializations = data.specializations;
                }

                const savedDoctorModel = await models.DoctorModel.create({
                    experience_years: data.experienceYears,
                    diploma: data.diploma,
                    license: data.license,
                    isActivated: false,
                    userId: savedUser.id
                });

                if (specializations.length > 0) {
                    const specializationModels = await Promise.all(
                        specializations.map(async (name) => {
                            const [specModel] = await models.SpecializationModel.findOrCreate({
                                where: { name },
                                defaults: { name }
                            });
                            return specModel; 
                        })
                    );

                    await savedDoctorModel.setSpecializations(specializationModels);
                }

                break;
        }

        await this.mailService.sendActivationEmail(data.email, activationLink);

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


    async logout(refreshToken: string): Promise<void> {
        if (!refreshToken) {
            throw new Error("Токен не найден");
        }

        const tokenData = this.tokenService.validateRefreshToken(refreshToken);
        if (!tokenData) {
            throw new Error("Не валирный токен");
        }

        await this.tokenService.removeToken(refreshToken);
    }

    async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string; }> {
        if (!refreshToken) {
            throw new Error("Токен не найден");
        }

        const userData = await this.tokenService.validateRefreshToken(refreshToken);
        if (!userData) {
            throw new Error("Не валирный токен");
        }

        const tokenFromDb = await this.tokenService.findToken(refreshToken);
        if (!tokenFromDb) {
            throw new Error("Токен не найден в базе данных");
        }

        const user = await this.userRepository.findById(userData.id);
        if (!user) {
            throw new Error('Пользователь не найден');
        }

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

    async activate(activationLink: string, userId: number): Promise<boolean> {
        const user = await this.userRepository.findByActivationLink(activationLink);
        if (!user) {
            return false;
        }

        if (user.id !== userId) {
            return false;
        }

        if (user.isActivated) {
            return true;
        }

        user.isActivated = true;
        await this.userRepository.save(user);
        return true;
    }

    async generateTelegramLinkToken(userId: number): Promise<string> {
        return await this.telegramService.generateLinkToken(userId);
    }

    async login(
        credential: string,
        pinCode: number,
        twoFactorMethod?: string,
        twoFactorCode?: string
    ): Promise<{
        user: User;
        accessToken: string;
        refreshToken: string;
        requiresTwoFactor?: boolean;
        tempToken?: string;
    }> {
        try {
            const user = await this.userRepository.findByEmailOrPhone(credential) as User;
            if (!user) {
                throw new Error("Пользователь не найден");
            }

            if (user.isBlocked) {
                throw new Error('Аккаунт заблокирован');
            }

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

            if (!twoFactorCode) {
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

                const tempToken = jwt.sign(
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
                    tempToken
                };
            }

            const isValid = await this.twoFactorService.verifyCode(user, twoFactorCode);
            if (!isValid) {
                throw new Error('Неверный код подтверждения');
            }

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
        } catch (e: any) {
            throw new Error(e.message);
        }
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

    async verifyTwoFactorCode(userId: number, code: string): Promise<boolean> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            return false;
        }
        return await this.twoFactorService.verifyCode(user, code);
    }

    async completeTwoFactorAuth(tempToken: string, code: string): Promise<{ accessToken: string; refreshToken: string; user: User; }> {
        const payload = jwt.verify(tempToken, this.twoFactorService.getTempSecret()) as jwt.JwtPayload & {
            id: number;
            email: string;
            role: string;
            twoFactorRequired: boolean;
        };

        if (!payload || !payload.twoFactorRequired) {
            throw new Error('Неверный временный токен');
        }

        const isValid = await this.verifyTwoFactorCode(payload.id, code);
        if (!isValid) {
            throw new Error('Неверный код подтверждения');
        }

        const user = await this.userRepository.findById(payload.id);
        if (!user) {
            throw new Error('Пользователь не найден');
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

        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: user
        };
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
        const userPhone = await this.userRepository.findByPhone(emailOrPhone);
        const userEmail = await this.userRepository.findByEmail(emailOrPhone);
        let method = null, user = null;
        if (!userPhone) {
            method = 'SMS';
            user = userEmail;
        } else if (!userEmail) {
            method = 'EMAIL';
            user = userPhone;
        }

        if (!user || !method) {
            throw new Error("Пользователь не найден");
        }

        const resetToken = v4();
        const resetTokenExpires = new Date(Date.now() + 3600000);

        await this.userRepository.save(user.setResetToken(resetToken, resetTokenExpires, user.pinCode));
        if (method === 'SMS') {
            await this.mailService.sendPinCodeResetEmail(user.email, resetToken);
        } else if (method === 'EMAIL') {
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
}