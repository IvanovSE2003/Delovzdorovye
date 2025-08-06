export default interface MailService {
    sendActivationEmail(to: string, activationLink: string): Promise<void>;
    sendPasswordResetEmail(to: string, resetToken: string): Promise<void>;
    sendTwoFactorEmail(to: string, code: string): Promise<void>;
    sendTwoFactorCode(to: string, code: string): Promise<void>;
}