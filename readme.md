## Full Featured Javascript Baileys Web API

<p>Xstro is a simple WhatsApp bot I made to make using WhatsApp faster and easier. It fully depends on the XSTRO API where all the functionality is processed. I used Axios to keep it lightweight and fast. All you need is a decent internet connection from your server.</p>

### SETUP

#### Fork the Repo

First, you gotta fork the repo to your own GitHub account.

[![FORK REPO](https://img.shields.io/badge/FORK_REPO-100000?style=for-the-badge&logo=github&logoColor=white&labelColor=black&color=black)](https://github.com/AstroX11/Xstro/fork)

### Get a Session

Grab a session to start using the bot.

[![GET SESSION](https://img.shields.io/badge/GET_SESSION-100000?style=for-the-badge&logo=render&logoColor=white&labelColor=black&color=black)](https://bit.ly/3OUQ4qF)

### Warning

I’m not responsible for you messing around and getting your account banned. As long as you don’t modify the source code to fit your idiotic needs, you’re fine. But seriously, don’t go spamming others. I’m tired of repeating this.

### DEPLOYMENT TO PLATFORMS

### Deploy to Render

1. Create an account on Render if you don’t already have one.

[![Create Render Account](https://img.shields.io/badge/-Create-black?style=for-the-badge&logo=render&logoColor=white)](https://dashboard.render.com/register)

2. Get your **DATABASE_URL** from the [Render Dashboard](https://dashboard.render.com/new/database) and copy it.

3. Now you can deploy.

[![Deploy to Render](https://img.shields.io/badge/-DEPLOY-black?style=for-the-badge&logo=render&logoColor=white)](https://render.com/deploy?repo=https://github.com/AstroX11/Xstro)

### Deploy to Heroku

1. Create an account on Heroku if you don’t have one.

[![Create Heroku Account](https://img.shields.io/badge/-Create-black?style=for-the-badge&logo=heroku&logoColor=white)](https://signup.heroku.com/)

2. Deploy the bot.

[![Deploy to Heroku](https://img.shields.io/badge/-Deploy-black?style=for-the-badge&logo=heroku&logoColor=white)](https://www.heroku.com/deploy?template=https://github.com/AstroX11/Xstro)

### Deploy to Koyeb

1. Create an account on Koyeb.

[![Create Koyeb Account](https://img.shields.io/badge/-Create-black?style=for-the-badge&logo=koyeb&logoColor=white)](https://app.koyeb.com/auth/signup)

2. Get your **DATABASE_URL** from Koyeb.

3. Deploy the bot.

[![Deploy to Koyeb](https://img.shields.io/badge/-DEPLOY-black?style=for-the-badge&logo=koyeb&logoColor=white)](https://app.koyeb.com/services/deploy/?type=git&repository=https%3A%2F%2Fgithub.com%2FAstroX11%2FXstro&branch=main&name=xstro-bot&builder=dockerfile&dockerfile=.%2Flib%2FDockerfile&ports=3000%3Bhttp%3B%2F&env%5BNODE_ENV%5D=production&env%5BSESSION_ID%5D=&env%5BSUDO%5D=2348039607375&env%5BCMD_REACT%5D=true&env%5BBOT_INFO%5D=Astro%3BXstro-Md%3B&env%5BMODE%5D=private&env%5BAUTO_STATUS_READ%5D=false&env%5BAUTO_READ%5D=false&env%5BSTICKER_PACK%5D=Astro%3BXstro&env%5BPREFIX%5D=.&env%5BLOGS%5D=false&env%5BPORT%5D=3000)

### Deploy to Replit

1. Create an account on Replit if you don’t have one.

[![Create Replit Account](https://img.shields.io/badge/-Create-black?style=for-the-badge&logo=replit&logoColor=white)](https://replit.com/signup)

2. Deploy the bot.

[![Deploy to Replit](https://img.shields.io/badge/-DEPLOY-black?style=for-the-badge&logo=replit&logoColor=white)](https://replit.com/github/AstroX11/Xstro)

### Deploy to Codespaces

1. Click Below to run on codespaces

[![Run on Codespaces](https://img.shields.io/badge/-Create-black?style=for-the-badge&logo=github&logoColor=white)](https://github.com/codespaces/new?skip_quickstart=true&machine=standardLinux32gb&repo=882210451&ref=master&geo=EuropeWest)

## RUN ON VPS OR LOCALLY

### 1. Install Node.js

Make sure Node.js is installed on your system.

### 2. Installation

```bash
npm i -g pm2 yarn
git clone https://github.com/AstroX11/Xstro.git
cd Xstro
yarn install
```

### 3. Configuration

Create the `.env` file with the required environment variables:

```bash
echo "VPS=true
NODE_ENV=production
SESSION_ID=null
SUDO=2348039607375
CMD_REACT=true
BOT_INFO=Astro;Xstro-Md;
MODE=private
AUTO_STATUS_READ=false
AUTO_READ=false
STICKER_PACK=Astro;Xstro
PREFIX=.
LOGS=false" > config.env
```

### 4. Start the Bot

```bash
npm start
```

### 5. Stop the Bot

```bash
npm stop
```

## CONTRIBUTING

If you want to help out or contribute to the project, feel free to fork the repo and create a pull request. Just don’t break anything.

[![Contribute](https://img.shields.io/badge/CONTRIBUTE-black?style=for-the-badge&logo=github&logoColor=white)](https://github.com/AstroX11/Xstro/blob/master/.github/contributing.md)

[![Join WhatsApp Group](https://img.shields.io/badge/Join_WhatsApp-black?style=for-the-badge&logo=whatsapp&logoColor=white)](https://chat.whatsapp.com/KxwEnQlmjWdAAQCfUaKgu4)
