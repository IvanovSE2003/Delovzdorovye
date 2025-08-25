export default interface MailService {
    sendActivationEmail(to: string, activationLink: string): Promise<void>;
    sendPinCodeResetEmail(to: string, resetToken: string): Promise<void>;
    sendTwoFactorEmail(to: string, code: string): Promise<void>;
    sendActivationPhone(to: string, code: string): Promise<void>;
    sendTwoFactorCode(to: string, code: string): Promise<void>;
}