import User from "../entities/user.entity.js";

export default interface TwoFactorService {
    generateCode(): string;
    sendCode(user: User, method: string, code: string): Promise<void>;
    verifyCode(user: User, code: string): Promise<boolean>;
    getTempSecret(): string;
}