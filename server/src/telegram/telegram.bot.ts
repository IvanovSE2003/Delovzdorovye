// telegram.bot.ts
import TelegramBot from 'node-telegram-bot-api';
import models from '../infrastructure/persostence/models/models.js';
const {UserTelegramModel} = models;

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN as string, { 
  polling: true, 
});

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from?.id;

  try {
    const tlcode = await UserTelegramModel.create({telegram_chat_id: chatId.toString(), userId})
    bot.sendMessage(chatId, '✅ Ваш аккаунт привязан к medOnline!');
  } catch (error) {
    bot.sendMessage(chatId, '❌ Ошибка привязки аккаунта. Попробуйте позже.');
  }
});