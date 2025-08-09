import SmsService from "../../domain/services/sms.service.js";
import TelegramService from '../../domain/services/telegram.service.js';
import models from '../../../infrastructure/persostence/models/models.js';
import { ITelegramCreationAttributes } from '../../../infrastructure/persostence/models/interfaces/telegram.model.js';
const { UserTelegramModel, UserModel } = models;

export default class SmsServiceImpl implements SmsService {
    constructor(
        private readonly telegramService: TelegramService
    ) {}

    async sendVerificationCode(phone: string, code: string): Promise<void> {
        const user = await UserModel.findOne({ where: { phone } });
            
        if (!user) {
            throw new Error('Пользователь не найден');
        }

        const userTelegram = await UserTelegramModel.findOne({where: { userId: user.id }}) as unknown as ITelegramCreationAttributes;

        if (userTelegram) {
            await this.telegramService.sendMessage(
                userTelegram.telegram_chat_id.toString(), 
                `🔐 Ваш код подтверждения для Дело в здоровье: **${code}**\nНе сообщайте его никому!`
            )
        }
    }

    async sendLoginNotification(userId: number): Promise<void> {
        const user = await UserModel.findByPk(userId);
        if (!user) {
            throw new Error('Пользователь не найден');
        }

        const userTelegram = await UserTelegramModel.findOne({where: { userId }}) as unknown as ITelegramCreationAttributes;

        if (userTelegram) {
            await this.telegramService.sendMessage(
                userTelegram.telegram_chat_id.toString(),  
                '🔔 В ваш аккаунт Дело в здоровье был выполнен вход. Если это не вы, смените пароль!'
            )
        }
    }
}