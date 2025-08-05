import AuthService from "../../domain/services/auth.service.js";
import UserRepository from "../../domain/repositories/user.repository.js";
import TokenService from "../../domain/services/token.service.js";
import MailService from "../../domain/services/mail.service.js";
import User from "../../domain/entities/user.entity.js";
import Patient from "../../domain/entities/patient.entity.js";
import Doctor from "../../domain/entities/doctor.entity.js";
import bcrypt from "bcrypt";
import { v4 } from "uuid";

export class AuthServiceImpl implements AuthService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly tokenService: TokenService,
        private readonly mailService: MailService
    ) {}

    async register(email: string, password: string, role: 'PACIENT' | 'DOCTOR' | 'ADMIN', name: string, surname: string, patronymic: string, phone: string, pinCode: number, gender: string, dateBirth: Date, timeZone: number, specialization: string, contacts: string, experienceYears: number): Promise<{ user: User; accessToken: string; refreshToken: string }> {
        const exists = await this.userRepository.checkUserExists(email, phone);
        if (exists) {
            throw new Error("Пользователя не существует");
        }

        const hashPassword = await bcrypt.hash(password, 5);
        const activationLink = v4();
        const user = new User(0, name, surname,patronymic,email, phone, pinCode, hashPassword, timeZone, dateBirth, gender, false, activationLink, "defaultImg.jpg", role, null, null);
        
        if(role === 'PACIENT') {
            const patient = new Patient(0, null, null, null, user.id);
            // const savedPatient = await this.
        } else if(role === 'DOCTOR') {
            const doctor = new Doctor(0, specialization, contacts, experienceYears, false ,user.id);
        }
        const savedUser = await this.userRepository.save(user);
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

    async login(credential: string, password: string,pinCode: number): Promise<{ user: User; accessToken: string; refreshToken: string }> {
        const user = await this.userRepository.findByEmailOrPhone(credential) as any;
        if (!user) {
            throw new Error("Пользователь не найден");
        }

        const isPinValid = await this.userRepository.verifyPinCode(user.id, pinCode);
        if (!isPinValid) {
            throw new Error("Неверный пин-код");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error("Неверный пароль");
        }

        const tokens = await this.tokenService.generateTokens({
            id: user.id,
            email: user.email,
            role: user.role,
        });

        await this.tokenService.saveToken(user.id, tokens.refreshToken);

        return {
            user,
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

    activate(activationLink: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    // async requestPasswordReset(user: User, )
}