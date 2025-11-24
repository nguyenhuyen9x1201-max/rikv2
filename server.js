// server.js (upgraded for modern Node + node-telegram-bot-api)
require('dotenv').config();
const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const expressWs = require('express-ws');
const path = require('path');

// Telegram
const TelegramApi = require('node-telegram-bot-api');

const app = express();
expressWs(app); // attach express-ws

// CORS + body parser + logging
app.use(cors({ origin: '*', optionsSuccessStatus: 200 }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('combined'));

// static / views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// DB init (giữ nguyên như hiện tại)
const configDB = require('./config/database');
const mongoose = require('mongoose');
try { require('mongoose-long')(mongoose); } catch(e) { console.warn('mongoose-long not installed or failed to load'); }

// Compatibility settings for modern mongoose
try {
  mongoose.set('strictQuery', false); // for mongoose >=6 compatibility
  mongoose.set('useFindAndModify', false);
  mongoose.set('useCreateIndex', true);
} catch(e){}

mongoose.connect(configDB.url, configDB.options).then(() => {
  console.log('MongoDB connected');
}).catch((err) => {
  console.error('MongoDB connect error:', err);
});

// config admin / cron / helpers (giữ nguyên)
try { require('./config/admin'); } catch(e){ console.warn('config/admin load failed:', e.message); }

// Telegram bot: tạo chỉ khi có token
const TELE_TOKEN = process.env.TELE_TOKEN || process.env.TELE_TOKEN_BAK;
let telegramBotInstance = null;

if (TELE_TOKEN) {
  telegramBotInstance = new TelegramApi(TELE_TOKEN, { polling: true });
  console.log('Telegram bot started (polling).');
} else {
  console.warn('Telegram token not found in environment; Telegram bot not started.');
}

// expose redT (websocket broadcast)
const redT = expressWs.getWss();
process.redT = redT;
redT.telegram = telegramBotInstance;
global.redT = redT;
global.SKnapthe = 2;
global.userOnline = 0;

// load socket/helpers/routes - these should remain compatible
try {
  require('./app/Helpers/socketUser')(redT);
} catch(e){ /* optional */ }
try {
  require('./routerHttp')(app, redT);
  require('./routerCMS')(app, redT);
  require('./routerSocket')(app, redT);
} catch(err) {
  console.error('Error while loading routes or sockets:', err);
}
try {
  require('./app/Cron/taixiu')(redT);
  require('./app/Cron/baucua')(redT);
} catch(e){ /* optional cron tasks */ }
try { require('./config/cron')(); } catch(e){ /* optional */ }

// Telegram module: prefer module that accepts bot instance, fallback to tele.js
try {
  if (telegramBotInstance) {
    // prefer app/Telegram/Telegram.js if exists and accepts bot instance
    const telegramModulePath = './app/Telegram/Telegram';
    try {
      const tgModule = require(telegramModulePath);
      if (typeof tgModule === 'function') {
        tgModule(telegramBotInstance);
      } else if (tgModule && typeof tgModule.init === 'function') {
        tgModule.init(telegramBotInstance);
      } else {
        // fallback to tele.js
        require('./tele')(telegramBotInstance);
      }
    } catch(e){
      // fallback tele.js
      require('./tele')(telegramBotInstance);
    }
  }
} catch(err){
  console.error('Telegram init error:', err);
}

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, function() {
  console.log('Server listen on port', PORT);
});
