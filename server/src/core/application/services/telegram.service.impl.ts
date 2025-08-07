import TelegramBot from 'node-telegram-bot-api';
import TelegramService from '../../domain/services/telegram.service.js';

export default class TelegramServiceImpl implements TelegramService {
    private telegramBot: TelegramBot;

    constructor() {
        this.telegramBot =  new TelegramBot(process.env.TELEGRAM_BOT_TOKEN as string);
    }

    async sendMessage(telegram_chat_id: string, text: string): Promise<void> {
        await this.telegramBot.sendMessage(
                telegram_chat_id,
                text,
                {parse_mode: 'Markdown'}
        );
    }
}