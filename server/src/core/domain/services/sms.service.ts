export default interface SmsService {
    sendVerificationCode(phone: string, code: string): Promise<void>;
    sendLoginNotification(phone: string): Promise<void>;
}