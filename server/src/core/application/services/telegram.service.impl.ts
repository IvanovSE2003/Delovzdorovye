import { Bot } from 'grammy';
import TelegramService from '../../domain/services/telegram.service.js';
import models from '../../../infrastructure/persostence/models/models.js';

const {UserTelegramModel} = models;

export default class TelegramServiceImpl implements TelegramService {
    private bot: Bot;
    private linkTokens = new Map<string, number>();

    constructor() {
        this.bot = new Bot(process.env.TELEGRAM_BOT_TOKEN as string);
        this.bot.start();
        console.log('Telegram bot started');
    }

    async sendMessage(telegram_chat_id: string, text: string): Promise<void> {
        try {
            await this.bot.api.sendMessage(telegram_chat_id, text, {
                parse_mode: 'Markdown'
            });
        } catch (error) {
            console.error('Telegram sendMessage error:', error);
            throw error;
        }
    }

    async generateLinkToken(userId: number): Promise<string> {
        const token = Math.random().toString(36).substring(2, 8);
        this.linkTokens.set(token, userId);
        setTimeout(() => {
            this.linkTokens.delete(token);
        }, 600000);
        
        return token;
    }

    private setupHandlers() {
        this.bot.command('start', async (ctx) => {
            await ctx.reply(
                'Добро пожаловать! Для привязки аккаунта введите /link [ваш_код]',
                { parse_mode: 'Markdown' }
            );
        });

        this.bot.command('link', async (ctx) => {
            const [_, code] = ctx.match;
            const chatId = ctx.chat.id.toString();
            
            if (!code) {
                await ctx.reply('❌ Укажите код привязки: /link [ваш_код]');
                return;
            }

            const userId = this.linkTokens.get(code);
            
            if (!userId) {
                await ctx.reply('❌ Неверный или просроченный код привязки');
                return;
            }

            try {
                await UserTelegramModel.create({
                    telegram_chat_id: chatId,
                    userId
                });
                
                this.linkTokens.delete(code);
                await ctx.reply('✅ Аккаунт успешно привязан!');
            } catch (error) {
                await ctx.reply('❌ Ошибка привязки аккаунта');
            }
        });
    }
}