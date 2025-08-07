export default interface SmsService {
    sendVerificationCode(phone: string, code: string): Promise<void>;
    sendLoginNotification(userId: number): Promise<void>;
}