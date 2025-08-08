import AuthService from "../../domain/services/auth.service.js";
import UserRepository from "../../domain/repositories/user.repository.js";
import TokenService from "../../domain/services/token.service.js";
import PatientRepository from "../../domain/repositories/patient.repository.js";
import MailService from "../../domain/services/mail.service.js";
import SmsService from "../../domain/services/sms.service.js";
import TelegramService from "../../domain/services/telegram.service.js";
import User from "../../domain/entities/user.entity.js";
import Patient from "../../domain/entities/patient.entity.js";
import Doctor from "../../domain/entities/doctor.entity.js";
import { v4 } from "uuid";
import TwoFactorService from "../../domain/services/twoFactor.service.js";
import jwt from 'jsonwebtoken'

export class AuthServiceImpl implements AuthService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly patientRepository: PatientRepository,
        private readonly doctorRepository: any,
        private readonly tokenService: TokenService,
        private readonly mailService: MailService,
        private readonly smsService: SmsService,
        private readonly twoFactorService: TwoFactorService,
        private readonly telegramService: TelegramService
    ) {}

    async register(email: string, role: 'PACIENT' | 'DOCTOR' | 'ADMIN', name: string, surname: string, patronymic: string, phone: string, pinCode: number, gender: string, dateBirth: Date, timeZone: number, specialization: string, contacts: string, experienceYears: number): Promise<{ user: User; accessToken: string; refreshToken: string }> {
        const exists = await this.userRepository.checkUserExists(email, phone);
        if (exists) {
            throw new Error("Пользователь с таким email или телефоном уже существует");
        }
        
        const activationLink = v4();
        const user = new User(0, name, surname,patronymic,email, phone, pinCode, timeZone, dateBirth, gender, false, activationLink, "defaultImg.jpg", role, null, null);
        const savedUser = await this.userRepository.save(user);

        if(role === 'PACIENT') {
            const patient = new Patient(0, null, null, null, false, savedUser.id);
            const savedPatient = await this.patientRepository.create(patient);
            console.log(savedPatient);
        } else if(role === 'DOCTOR') {
            const doctor = new Doctor(0, specialization, contacts, experienceYears, false);
        }
        await this.mailService.sendActivationEmail(email, activationLink);

        const tokens = await this.tokenService.generateTokens({
            id: savedUser.id,
            email: savedUser.email,
            role: savedUser.role,
        });

        return {
            user: savedUser,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        };
    }

    async logout(refreshToken: string): Promise<void> {
        if(!refreshToken) {
            throw new Error("Токен не найден");
        }
        
        const tokenData = this.tokenService.validateRefreshToken(refreshToken);
        if(!tokenData) {
            throw new Error("Не валирный токен");
        }

        await this.tokenService.removeToken(refreshToken);
    }

    async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string; }> {
        if(!refreshToken) {
            throw new Error("Токен не найден");
        }

        const userData = await this.tokenService.validateRefreshToken(refreshToken);
        if(!userData) {
            throw new Error("Не валирный токен");
        }

        const tokenFromDb = await this.tokenService.findToken(refreshToken);
        if(!tokenFromDb) {
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
        return this.telegramService.generateLinkToken(userId);
    }

    async login(credential: string, pinCode: number): Promise<{ user: User; accessToken: string; refreshToken: string }> {
        try {
            const user = await this.userRepository.findByEmailOrPhone(credential) as any;
            if (!user) {
                throw new Error("Пользователь не найден");
            }

            const isPinValid = await this.userRepository.verifyPinCode(user.id, pinCode);
            if (!isPinValid) {
                throw new Error("Неверный пин-код");
            }

            const tokens = await this.tokenService.generateTokens({
                id: user.id,
                email: user.email,
                role: user.role
            });

            await this.tokenService.saveToken(user.id, tokens.refreshToken);

            return {
                user,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
            };
        } catch(e: any) {
            throw new Error(e.message)
        }
    }

    async sendTwoFactorCode(creditial: string, method: string): Promise<void> {
        const user = await this.userRepository.findByEmailOrPhone(creditial) as any;

        const code = this.twoFactorService.generateCode();
        const expires = new Date(Date.now() + 5 * 60 * 1000); 
        await this.userRepository.save(user.setTwoFactorCode(code, expires));
        await this.twoFactorService.sendCode(user, method, code);
    }

    async verifyTwoFactorCode(userId: number, code: string): Promise<boolean> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            return false;
        }
        return await this.twoFactorService.verifyCode(user, code);
    }

    async completeTwoFactorAuth(tempToken: string, code: string): Promise<{ accessToken: string; refreshToken: string }> {
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

        return tokens;
    }

    async sendLoginNotification(phone: string, code: string): Promise<void> {
        const user = await this.userRepository.findByPhone(phone) as unknown as User;
        if(!user) {
            throw new Error('Пользователь не найден');
        }

        if(user.twoFactorCode !== code) {
            throw new Error('Код не верный')
        }
        await this.smsService.sendLoginNotification(user.id)
    }
}