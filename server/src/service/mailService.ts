import nodemailer from 'nodemailer'

class MailService {
    private static transporter: nodemailer.Transporter;

    static initialize() {
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

    static async sendActivationEmail(to: string, link: string) {
        if (!this.transporter) {
            this.initialize();
        }

        const activationUrl = `${process.env.API_URL}/api/user/activate/${link}`;
        try {
            await this.transporter.sendMail({
                from: `"Медицинский сервис medOnline" <${process.env.SMTP_USER}>`,
                to,
                subject: 'Активация аккаунта',
                text: `Для активации вашего аккаунта перейдите по ссылке: ${activationUrl}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h1 style="color: #2563eb;">Добро пожаловать!</h1>
                        <p>Для завершения регистрации и активации вашего аккаунта, пожалуйста, перейдите по ссылке ниже:</p>
                        <a href="${activationUrl}" 
                            style="cursor: poiter; display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
                            Активировать аккаунт
                        </a>
                        <p>Если кнопка не работает, скопируйте и вставьте эту ссылку в браузер:</p>
                        <p style="word-break: break-all;">${activationUrl}</p>
                        <p><b>Если вы не регистрировались на нашем сервисе, просто проигнорируйте это письмо.</b></p>
                        <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                            С уважением,<br>
                            Команда medOnline
                        </p>
                    </div>
                `,
            });
        } catch (error) {
            throw new Error('Ошибка отправки активационной ссылке по почте');
        }
    }

    static async sendPasswordResetEmail(to: string, resetToken: string) {
        if (!this.transporter) {
            this.initialize();
        }

        const resetUrl = `${process.env.CLIENT_URL}/password-reset/${resetToken}`;
        try {
            await this.transporter.sendMail({
                from: `"Медицинский сервис medOnline" <${process.env.SMTP_USER}>`,
                to,
                subject: 'Сброс пароля',
                text: `Для сброса пароля перейдите по ссылке: ${resetUrl}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h1 style="color: #2563eb;">Сброс пароля</h1>
                        <p>Для сброса пароля вашего аккаунта, пожалуйста, перейдите по ссылке ниже:</p>
                        <a href="${resetUrl}" 
                            style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
                            Сбросить пароль
                        </a>
                        <p>Если кнопка не работает, скопируйте и вставьте эту ссылку в браузер:</p>
                        <p style="word-break: break-all;">${resetUrl}</p>
                        <p><b>Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.</b></p>
                        <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                            С уважением,<br>
                            Команда medOnline
                        </p>
                    </div>
                `,
            });
        } catch (error) {
            throw new Error('Ошибка отправки письма для сброса пароля');
        }
    }
}

export default MailService;