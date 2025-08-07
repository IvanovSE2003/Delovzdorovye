export default interface TelegramService {
    sendMessage(telegram_chat_id: string, text: string): Promise<void>;
}