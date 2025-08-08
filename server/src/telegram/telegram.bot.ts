// src/telegram.bot.ts
import { Bot } from 'grammy';

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN!);

// Обработчики команд
bot.command('start', async (ctx) => {
  await ctx.reply('Бот работает!');
});

// Graceful shutdown
let isShuttingDown = false;

async function shutdown() {
  if (isShuttingDown) return;
  isShuttingDown = true;
  
  console.log('Остановка бота...');
  await bot.stop();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Запуск с проверкой
let isRunning = false;

async function startBot() {
  if (isRunning) {
    console.log('Бот уже запущен');
    return;
  }

  try {
    isRunning = true;
    await bot.start();
    console.log('Бот успешно запущен');
  } catch (err) {
    console.error('Ошибка запуска:', err);
    process.exit(1);
  }
}

startBot();