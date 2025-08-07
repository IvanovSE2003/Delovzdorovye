import { Bot } from 'grammy';
import models from '../infrastructure/persostence/models/models.js';
const { UserTelegramModel } = models;

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN as string);

bot.command('start', async (ctx) => {
  const chatId = ctx.chat.id;
  const userId = ctx.from?.id;

  try {
    await UserTelegramModel.create({
      telegram_chat_id: chatId.toString(),
      userId
    });
    await ctx.reply('✅ Ваш аккаунт привязан к medOnline!');
  } catch (error) {
    console.error('Ошибка привязки аккаунта:', error);
    await ctx.reply('❌ Ошибка привязки аккаунта. Попробуйте позже.');
  }
});

bot.start();
console.log('Telegram bot started in polling mode');