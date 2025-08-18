import { Bot } from 'grammy';
import TelegramService from '../../domain/services/telegram.service.js';
import models from '../../../infrastructure/persostence/models/models.js';
import { Op } from 'sequelize';
import UserRepositoryImpl from '../repositories/user.repository.impl.js';
import UserRepository from '../../domain/repositories/user.repository.js';

const { UserTelegramModel } = models;

export default class TelegramServiceImpl implements TelegramService {
    private bot: Bot;
    private linkTokens = new Map<string, number>();
    private cleanupTimers = new Map<string, NodeJS.Timeout>();
    private readonly userRepository: UserRepository = new UserRepositoryImpl(); 

    constructor() {
        this.bot = new Bot(process.env.TELEGRAM_BOT_TOKEN as string);
        this.setupHandlers();
    }

    async start(): Promise<void> {
        try {
            await this.bot.start();
        } catch (error) {
            throw error;
        }
    }

    async stop(): Promise<void> {
        await this.bot.stop();
        this.cleanupTimers.forEach(timer => clearTimeout(timer));
    }

    async sendMessage(telegram_chat_id: string, text: string, parse_mode: object = { parse_mode: 'Markdown' }): Promise<void> {
        try {
            await this.bot.api.sendMessage(telegram_chat_id, text, parse_mode);
        } catch (error) {
            console.error('Telegram sendMessage error:', error);
            throw error;
        }
    }

    async generateLinkToken(userId: number): Promise<string> {
        const token = Math.random().toString(36).substring(2, 8);
        this.linkTokens.set(token, userId);

        const timer = setTimeout(() => {
            this.linkTokens.delete(token);
            this.cleanupTimers.delete(token);
        }, 600000);

        this.cleanupTimers.set(token, timer);
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
            const text = ctx.message?.text ?? '';
            const parts = text.split(' ');
            const code = parts[1];
            const chatId = ctx.chat.id.toString();

            if (!code) {
                await ctx.reply('❌ Укажите код привязки: /link [ваш_код]');
                return;
            }

            const userId = this.linkTokens.get(code);
            const user = await this.userRepository.findById(Number(userId));

            if (!userId) {
                await ctx.reply('❌ Неверный или просроченный код привязки');
                return;
            }

            try {
                const existingLink = await UserTelegramModel.findOne({
                    where: {
                        [Op.or]: [
                            { userId: userId },
                            { telegram_chat_id: chatId }
                        ]
                    }
                });

                if (existingLink) {
                    await ctx.reply('❌ Этот аккаунт уже привязан к другому Telegram');
                    return;
                }

                await UserTelegramModel.create({
                    telegram_chat_id: chatId,
                    userId
                });

                this.linkTokens.delete(code);
                if (this.cleanupTimers.has(code)) {
                    clearTimeout(this.cleanupTimers.get(code));
                    this.cleanupTimers.delete(code);
                }

                if(user) {
                    await this.userRepository.save(user.activateSMS())
                }

                await ctx.reply('✅ Аккаунт успешно привязан!');
            } catch (error) {
                console.error('Linking error:', error);
                await ctx.reply('❌ Ошибка привязки аккаунта');
            }
        });
    }
}