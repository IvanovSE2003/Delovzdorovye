import nodemailer from 'nodemailer'

class mailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            },
        } as nodemailer.TransportOptions) 
    }

    static async sendActivationEmail(to: string, link: string) {
        // await this.transporter.sendMail({
        //     from: process.env.SMTP_USER, 
        //     to, 
        //     subject: 'Активация аккаунта', 
        //     text: '', 
        //     html: `
        //         <div>
        //             <h1>Для активации перейдите по ссылке</h1>
        //             <a href="${link}">${link}</a>
        //         </div>
        //     `, 
        // });
    }
}

export default mailService;