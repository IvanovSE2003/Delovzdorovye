import TwoFactorService from "../../domain/services/twoFactor.service.js";
import User from "../../domain/entities/user.entity.js";
import MailService from "../../domain/services/mail.service.js";
import SmsService from "../../domain/services/sms.service.js";

export default class TwoFactorServiceImpl implements TwoFactorService {
    constructor(
        private readonly mailService: MailService,
        private readonly smsService: SmsService,
        private readonly tempSecret: string
    ) {}

    generateCode(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async sendCode(user: User, method: string, code: string): Promise<void> {
        if (method === 'EMAIL') {
            await this.mailService.sendTwoFactorCode(user.email, code);
        } else if (method === 'SMS') {
            await this.smsService.sendVerificationCode(user.phone, code);
        }
    }

    async verifyCode(user: User, code: string): Promise<boolean> {
        if (!user.twoFactorCode || !user.twoFactorCodeExpires) {
            return false;
        }

        if (new Date() > user.twoFactorCodeExpires) {
            return false;
        }

        return user.twoFactorCode == code;
    }

    getTempSecret(): string {
        return this.tempSecret;
    }
}