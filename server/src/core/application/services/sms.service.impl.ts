import SmsService from "../../domain/services/sms.service.js";
import TelegramService from '../../domain/services/telegram.service.js';
import models from '../../../infrastructure/persostence/models/models.js';
import { ITelegramCreationAttributes } from '../../../infrastructure/persostence/models/interfaces/telegram.model.js';
import UserRepository from "../../domain/repositories/user.repository.js";

const { UserTelegramModel, UserModel } = models;

export default class SmsServiceImpl implements SmsService {
    constructor(
        private readonly telegramService: TelegramService,
        private readonly userRepository: UserRepository
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
                `🔐 Ваш код подтверждения для Дело в здоровье: **${code}**\nНе сообщайте его никому!`,
                {parse_mode: 'Markdown'}
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
                '🔔 В ваш аккаунт Дело в здоровье был выполнен вход. Если это не вы, смените пароль!',
                {parse_mode: 'Markdown'}
            )
        } else {
            throw new Error('Пользователь не подключен к телеграм боту');
        }
    }

    async sendPinCodeResetEmail(phone: string, resetToken: string): Promise<void> {
        const user = await this.userRepository.findByPhone(phone);
        if(!user) {
            throw new Error('Пользователь не найден');
        }

        const resetUrl = `${process.env.CLIENT_URL}/pinCode-reset/${resetToken}`;
        const userTelegram = await UserTelegramModel.findOne({where: { userId: user.id }}) as unknown as ITelegramCreationAttributes;

        if (userTelegram) {
            await this.telegramService.sendMessage(
                userTelegram.telegram_chat_id.toString(),  
                `🛠️ Перейдите по ссылке для смены пин-кода \n${resetUrl} \n\n‼️Если вы не запрашивали сброс, проигнорируйте это сообщение.‼️`,
                { parse_mode: 'markdown' }
            )
        } else {
            throw new Error('Пользователь не подключен к телеграм боту');
        }
    }
}