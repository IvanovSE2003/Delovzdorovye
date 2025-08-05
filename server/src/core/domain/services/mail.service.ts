export default interface MailService {
    sendActivationEmail(to: string, activationLink: string): Promise<void>;
    sendPasswordResetEmail(to: string, resetToken: string): Promise<void>;
}