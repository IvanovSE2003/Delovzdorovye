import MailService from "../../domain/services/mail.service.js";
import nodemailer from 'nodemailer';

export default class MailServiceImpl implements MailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        } as nodemailer.TransportOptions);
    }

    async sendActivationEmail(to: string, activationLink: string): Promise<void> {
        const activationUrl = `${process.env.API_URL}/api/user/activate/${activationLink}`;
        
        try {
            await this.transporter.sendMail({
                from: `"Медицинский сервис Дело в здоровье" <${process.env.SMTP_USER}>`,
                to,
                subject: 'Активация аккаунта',
                text: `Для активации перейдите по ссылке: ${activationUrl}`,
                html: this.getActivationEmailHtml(activationUrl)
            });
        } catch (error) {
            console.error('Ошибка отправки письма активации:', error);
            throw new Error('Ошибка отправки активационного письма');
        }
    }

    async sendPinCodeResetEmail(to: string, resetToken: string): Promise<void> {
        const resetUrl = `${process.env.CLIENT_URL}/pinCode-reset/${resetToken}`;
        
        try {
            await this.transporter.sendMail({
                from: `"Медицинский сервис Дело в здоровье" <${process.env.SMTP_USER}>`,
                to,
                subject: 'Сброс пин-кода',
                text: `Для сброса пин-кода перейдите по ссылке: ${resetUrl}`,
                html: this.getPasswordResetEmailHtml(resetUrl)
            });
        } catch (error) {
            console.error('Ошибка отправки письма сброса пароля:', error);
            throw new Error('Ошибка отправки письма для сброса пароля');
        }
    }

    async sendTwoFactorEmail(to: string, code: string): Promise<void> {
        try {
            await this.transporter.sendMail({
                from: `"Медицинский сервис medOnline" <${process.env.SMTP_USER}>`,
                to,
                subject: 'Код двухэтапной аутентификации',
                text: `Ваш код подтверждения: ${code}`,
                html: this.getTwoFactorEmailHtml(code)
            });
        } catch (error) {
            console.error('Ошибка отправки кода 2FA:', error);
            throw new Error('Ошибка отправки кода подтверждения');
        }
    }

    async sendTwoFactorCode(to: string, code: string): Promise<void> {
        try {
            await this.transporter.sendMail({
                from: `"Медицинский сервис Дело в здоровье" <${process.env.SMTP_USER}>`,
                to,
                subject: 'Код двухэтапной аутентификации',
                text: `Ваш код подтверждения: ${code}`,
                html: this.getTwoFactorEmailHtml(code)
            });
        } catch (error) {
            console.error('Ошибка отправки кода 2FA:', error);
            throw new Error('Ошибка отправки кода подтверждения');
        }
    }

    private getTwoFactorEmailHtml(code: string): string {
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #2563eb;">Код подтверждения</h1>
                <p>Для входа в аккаунт используйте следующий код:</p>
                <div style="font-size: 24px; font-weight: bold; letter-spacing: 2px; 
                    margin: 20px 0; padding: 10px; background: #f3f4f6; 
                    display: inline-block; border-radius: 4px;">
                    ${code}
                </div>
                <p>Код действителен в течение 5 минут.</p>
                <p><b>Если вы не запрашивали вход, проигнорируйте это письмо.</b></p>
                <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                    С уважением,<br>Команда Дело в здоровье
                </p>
            </div>
        `;
    }

    private getPasswordResetEmailHtml(resetUrl: string): string {
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #2563eb;">Сброс пин-кода</h1>
                <p>Для сброса пин-кода перейдите по ссылке:</p>
                <a href="${resetUrl}" 
                    style="display: inline-block; padding: 12px 24px; 
                    background-color: #2563eb; color: white; 
                    text-decoration: none; border-radius: 4px; margin: 20px 0;">
                    Сбросить пин-код
                </a>
                <p>Или скопируйте ссылку в браузер:</p>
                <p style="word-break: break-all;">${resetUrl}</p>
                <p><b>Если вы не запрашивали сброс, проигнорируйте это письмо.</b></p>
                <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                    С уважением,<br>Команда Дело в здоровье
                </p>
            </div>
        `;
    }

    private getActivationEmailHtml(activationUrl: string): string {
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #2563eb;">Добро пожаловать!</h1>
                <p>Для завершения регистрации перейдите по ссылке:</p>
                <a href="${activationUrl}" 
                    style="display: inline-block; padding: 12px 24px; 
                    background-color: #2563eb; color: white; 
                    text-decoration: none; border-radius: 4px; margin: 20px 0;">
                    Активировать аккаунт
                </a>
                <p>Или скопируйте ссылку в браузер:</p>
                <p style="word-break: break-all;">${activationUrl}</p>
                <p><b>Если вы не регистрировались, проигнорируйте это письмо.</b></p>
                <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                    С уважением,<br>Команда Дело в здоровье
                </p>
            </div>
        `;
    }
}