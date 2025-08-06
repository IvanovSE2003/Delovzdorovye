// sms.service.impl.ts
import twilio from 'twilio';
import SmsService from "../../domain/services/sms.service.js";
import ApiError from '../../../infrastructure/web/error/ApiError.js';

export default class SmsServiceImpl implements SmsService {
    private client: twilio.Twilio | null;
    private readonly serviceSid: string;
    private readonly fromNumber: string;
    private readonly isProduction: boolean;

    constructor() {
        this.isProduction = process.env.NODE_ENV === 'production';
        
        if (this.isProduction) {
            if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
                throw new Error('Учетные данные Twilio не настроены');
            }

            if (!process.env.TWILIO_ACCOUNT_SID.startsWith('AC')) {
                throw new Error('TWILIO_ACCOUNT_SID должен начинаться с "AC"');
            }

            this.client = twilio(
                process.env.TWILIO_ACCOUNT_SID,
                process.env.TWILIO_AUTH_TOKEN
            );
        } else {
            this.client = null;
            console.log('[SMS Service] Режим разработки - SMS не отправляются реально');
        }

        this.serviceSid = process.env.TWILIO_SERVICE_SID || '';
        this.fromNumber = process.env.TWILIO_PHONE_NUMBER || '';
    }

    async sendVerificationCode(phone: string, code: string): Promise<void> {
        try {
            if (!this.isProduction) {
                console.log(`[DEV SMS] Код подтверждения для ${phone}: ${code}`);
                return;
            }

            if (this.serviceSid && this.client) {
                await this.client.verify.v2.services(this.serviceSid)
                    .verifications
                    .create({ to: phone, channel: 'sms' });
            } 
            else if (this.fromNumber && this.client) {
                await this.client.messages.create({
                    body: `Ваш код подтверждения для medOnline: ${code}`,
                    from: this.fromNumber,
                    to: phone
                });
            } else {
                throw new Error('SMS service not properly configured');
            }
        } catch (error) {
            console.error('SMS sending error:', error);
            throw ApiError.internal('Ошибка отправки SMS');
        }
    }

    async sendLoginNotification(phone: string): Promise<void> {
        try {
            if (!this.isProduction) {
                console.log(`[DEV SMS] Уведомление о входе для ${phone}`);
                return;
            }

            if (!this.fromNumber || !this.client) {
                throw new Error('Twilio phone number not configured');
            }

            await this.client.messages.create({
                body: 'Был выполнен вход в ваш аккаунт medOnline. Если это были не вы, срочно смените пароль.',
                from: this.fromNumber,
                to: phone
            });
        } catch (error) {
            console.error('Login notification SMS error:', error);
        }
    }
}