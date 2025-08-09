export default interface TelegramService {
    sendMessage(telegram_chat_id: string, text: string, parse_mode: object): Promise<void>;
    generateLinkToken(userId: number): Promise<string>;
}