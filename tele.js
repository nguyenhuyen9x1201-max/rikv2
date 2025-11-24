// tele.js - Telegram handler using node-telegram-bot-api
// Usage:
//   In server.js: require('./tele')(telegramBotInstance);
//   Or run standalone: node tele.js (will create its own bot if process.env.TELE_TOKEN set)

module.exports = function(botInstance) {
  const TelegramApi = require('node-telegram-bot-api');

  let bot = botInstance || null;
  const TOKEN = process.env.TELE_TOKEN || process.env.TELE_TOKEN_BAK;

  if (!bot) {
    if (!TOKEN) {
      console.warn('No TELE_TOKEN found. Telegram handlers will not be active.');
      return;
    }
    bot = new TelegramApi(TOKEN, { polling: true });
    console.log('tele.js: created Telegram bot (standalone).');
  } else {
    console.log('tele.js: using provided Telegram bot instance.');
  }

  // Example: basic handlers (adapt to your previous Telegram handlers)
  bot.on('message', async (msg) => {
    try {
      const chatId = msg.chat.id;
      if (msg.text && msg.text.startsWith('/start')) {
        await bot.sendMessage(chatId, 'Xin chào! Bot đã được kết nối với server.');
      }
      // Add more handlers as needed. If your old code used commands or callbacks,
      // reimplement logic here or in app/Telegram/Telegram.js
    } catch (err) {
      console.error('Telegram handler error:', err);
    }
  });

  return bot;
};
