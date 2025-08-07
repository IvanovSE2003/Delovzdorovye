import User from "../entities/user.entity.js";

export default interface AuthService {
    register(
        email: string,
        role: 'PACIENT' | 'DOCTOR' | 'ADMIN',
        name: string,
        surname: string,
        patronymic: string,
        phone: string,
        pinCode: number,
        gender: string,
        dateBirth: Date,
        timeZone: number,
        specialization: string,
        contacts: string,
        experienceYears: number
    ): Promise<{ user: User; accessToken: string; refreshToken: string }>;

    login(
        credential: string,
        pinCode: number
    ): Promise<{ user: User; accessToken: string; refreshToken: string }>;

    logout(refreshToken: string): Promise<void>;
    refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }>;
    activate(activationLink: string, userId: number): Promise<boolean>;

    sendTwoFactorCode(creditial: string, method: string): Promise<void>;
    verifyTwoFactorCode(userId: number, code: string): Promise<boolean>;
    completeTwoFactorAuth(tempToken: string, code: string): Promise<{ accessToken: string; refreshToken: string }>;  
    sendLoginNotification(phone: string, code: string): Promise<void>;  
}