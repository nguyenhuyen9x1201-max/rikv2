README - Upgrade Patch (what I changed & how to apply)

Files created in this patch:
  - /app/Helpers/Helpers.js         (new helper using bcryptjs)
  - /server.js                      (upgraded main server bootstrap)
  - /tele.js                        (Telegram handlers using node-telegram-bot-api)
  - /package.json                   (recommended dependencies & start script)
  - /README_UPGRADE.md              (this file)

How to apply:
  1. Backup your project:
     git add -A && git commit -m "backup before assistant patch"
     git checkout -b upgrade/modern-node

  2. Copy files from this package to your project root, preserving paths.
     Example (from project root):
       cp /path/to/upgrade_patch/server.js ./server.js
       cp /path/to/upgrade_patch/tele.js ./tele.js
       mkdir -p ./app/Helpers && cp /path/to/upgrade_patch/Helpers.js ./app/Helpers/Helpers.js
       cp /path/to/upgrade_patch/package.json ./package.json

  3. Install dependencies (prefer using nvm to pick your node version):
       # ensure Node >=16 (Node 18 recommended)
       nvm install 18 && nvm use 18
       rm -rf node_modules package-lock.json
       npm install

     If you rely on native modules like canvas, you might need system libs:
       sudo apt update
       sudo apt install -y build-essential pkg-config libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev python3

     For canvas ON VERY NEW Node (v24+) you may still see build issues. In that case
     prefer Node 18 to build native modules then switch to your target Node.

  4. Run the server:
       node server.js
     or with pm2:
       pm2 start server.js --name game-server

Notes & next steps:
  - I created a minimal Helpers.js. If you already have a Helpers.js, merge functions: generateHash, validPassword, getConfig, setConfig.
  - I retained your route and socket files. If any controllers use 'request' or 'bcrypt' replace with axios/bcryptjs respectively. I can do that if you upload those files.
  - If you have app/Telegram/Telegram.js, upload it and I'll port its logic to work with node-telegram-bot-api (passing the bot instance).
  - After applying, run the server and paste any errors here — I'll fix them one by one.
