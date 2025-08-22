import User from "../entities/user.entity.js";
import regData from "../../../infrastructure/web/types/reqData.type.js";


export default interface AuthService {
    register(data: regData): Promise<{ user: User; accessToken: string; refreshToken: string }>;

    login(credential: string, pinCode: number, twoFactorMethod?: string, twoFactorCode?: string): Promise<{ user: User; accessToken: string; refreshToken: string }>;

    logout(refreshToken: string): Promise<void>;
    refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }>;
    activate(activationLink: string, userId: number): Promise<boolean>;

    sendTwoFactorCode(creditial: string, method: string): Promise<void>;
    verifyTwoFactorCode(userId: number, code: string): Promise<boolean>;
    completeTwoFactorAuth(tempToken: string, code: string): Promise<{accessToken: string; refreshToken: string; user: User; }>;  
    sendLoginNotification(phone: string, code: string): Promise<void>;  

    generateTelegramLinkToken(userId: number): Promise<string>;

    requestPinReset(emailOrPhone: string): Promise<void>;
    resetPin(resetToken: string, newPin: number): Promise<void>;

    unblockAccount(userId: number): Promise<void>;
    blockAccount(userId: number): Promise<void>;
    sendActivationEmail(email: string, activationLink: string): Promise<void>;
}