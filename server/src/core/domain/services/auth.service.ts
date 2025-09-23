import User from "../entities/user.entity.js";
import regData from "../../../infrastructure/web/types/reqData.type.js";
import dataResult from "../../../infrastructure/web/types/dataResultAuth.js";


export default interface AuthService {
    register(data: regData): Promise<{ user: User; accessToken: string; refreshToken: string }>;

    login(credential: string, pinCode: number, twoFactorMethod?: string, twoFactorCode?: string): Promise<dataResult>;

    logout(refreshToken: string): Promise<void>;
    refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }>;

    sendTwoFactorCode(creditial: string, method: string): Promise<void>;
    completeTwoFactorAuth(tempToken: string, code: string): Promise<{ accessToken: string; refreshToken: string; user: User; }>;
    sendLoginNotification(phone: string, code: string): Promise<void>;

    generateTelegramLinkToken(userId: number): Promise<string>;

    requestPinReset(emailOrPhone: string): Promise<void>;
    resetPin(resetToken: string, newPin: number): Promise<void>;

    unblockAccount(userId: number): Promise<void>;
    blockAccount(userId: number): Promise<void>;
    sendActivationEmail(email: string, activationLink: string): Promise<void>;
    sendActivationPhone(email: string, token: string): Promise<void>;

    registerWithTwoFactor(data: regData): Promise<{ requiresTwoFactor: boolean; tempToken: string }>;
    completeRegistration(tempToken: string, code: string): Promise<{ accessToken: string; refreshToken: string; user: User }>;
}