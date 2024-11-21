### XSTRO MD BOT

<p>Simple WhatsApp Bot Created to make the way you use whatsapp faster, simpler and easier. Xstro Md full depends on the xstro api where all misc functionalites are stored and processed with built in fetch or axios, well I did this to make this bot extermely lightweight and very fast in any operation all you need is a fast internet from your server lol.</p>

#### SETUP

<a href='https://github.com/AstroX11/Xstro/fork' target="_blank"><img alt='FORK' src='https://img.shields.io/badge/FORK REPO-100000?style=for-the-badge&logo=github&logoColor=white&labelColor=black&color=black'/></a>

<a href='https://xstro-pair-ajbz.onrender.com' target="_blank"><img alt='SESSION' src='https://img.shields.io/badge/GET SESSION-100000?style=for-the-badge&logo=render&logoColor=white&labelColor=black&color=black'/></a>

#### IMPORTANT TO NOTE

<p>Look kid, I ain't responsible for your misuse and abuse of this software, but I can indeed assure you that your whatsapp account won't get banned if you don't modify the source code to fit your stupid expectances, but look don't go f*** your whatsapp account with spamming others (Well No Spam in this bot) I'm tired lol.</p>

#### DEPLOY TO RENDER

1. If You don't have a account in render. Create a account.
   <br>
   <a href='https://dashboard.render.com/register' target="_blank"><img alt='render' src='https://img.shields.io/badge/-Create-black?style=for-the-badge&logo=render&logoColor=white'/></a>

2. Get [DATABASE_URL](https://dashboard.render.com/new/database) and copy it

3. Get [Render api key](https://dashboard.render.com/u/settings#api-keys)

4. Now Deploy
   <br>
   <a href='https://render.com/deploy?repo=https://github.com/AstroX11/Xstro' target="_blank"><img alt='DEPLOY' src='https://img.shields.io/badge/-DEPLOY-black?style=for-the-badge&logo=render&logoColor=white'/></a>

#### DEPLOY TO HEROKU

1. If you don't have an heroku account, Create one.
   <br>
   <a href='https://signup.heroku.com/' target="_blank"><img alt='heroku' src='https://img.shields.io/badge/-Create-black?style=for-the-badge&logo=heroku&logoColor=white'/></a>

2. Now Deploy
   <br>
   <a href='https://www.heroku.com/deploy?template=https://github.com/AstroX11/Xstro' target="_blank"><img alt='heroku' src='https://img.shields.io/badge/-Deploy-black?style=for-the-badge&logo=heroku&logoColor=white'/></a>

#### DEPLOY TO KOYEB

1. If You don't have a account in koyeb. Create a account.
   <br>
   <a href='https://app.koyeb.com/auth/signup' target="_blank"><img alt='koyeb' src='https://img.shields.io/badge/-Create-black?style=for-the-badge&logo=koyeb&logoColor=white'/></a>

2. Create [DATABASE_URL](https://app.koyeb.com/database-services/new) and copy it

3. Now Deploy
   <br>
   <a href='https://app.koyeb.com/services/deploy/?type=git&repository=https%3A%2F%2Fgithub.com%2FAstroX11%2FXstro&branch=main&name=xstro-bot&builder=dockerfile&dockerfile=.%2Flib%2FDockerfile&ports=3000%3Bhttp%3B%2F&env%5BNODE_ENV%5D=production&env%5BSESSION_ID%5D=&env%5BSUDO%5D=2348039607375&env%5BCMD_REACT%5D=true&env%5BBOT_INFO%5D=Astro%3BXstro-Md%3B&env%5BMODE%5D=private&env%5BAUTO_STATUS_READ%5D=false&env%5BAUTO_READ%5D=false&env%5BSTICKER_PACK%5D=Astro%3BXstro&env%5BPREFIX%5D=.&env%5BLOGS%5D=false&env%5BPORT%5D=3000
   ' target="_blank"><img alt='DEPLOY' src='https://img.shields.io/badge/-DEPLOY-black?style=for-the-badge&logo=koyeb&logoColor=white'/></a>

#### DEPLOY TO REPLIT

1. If you don't have a Replit account, create one.  
   <a href='https://replit.com/signup' target="_blank"><img alt='Replit' src='https://img.shields.io/badge/-Create-black?style=for-the-badge&logo=replit&logoColor=white'/></a>

2. Deploy your project by clicking the button below:  
   <a href='https://replit.com/github/AstroX11/Xstro' target="_blank"><img alt='DEPLOY' src='https://img.shields.io/badge/-DEPLOY-black?style=for-the-badge&logo=replit&logoColor=white'/></a>

---

### RUN ON VPS && LOCAL

#### 1. Install Node.js

Ensure Node.js is installed on your system.

#### 2. Installation

```bash
npm i -g pm2 yarn
git clone https://github.com/AstroX11/Xstro.git
cd Xstro
yarn install
```

#### 3. Configuration

Create the configuration file with the updated environment variables:

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

#### 4. Start

```bash
npm start
```

#### 5. Stop

```bash
npm stop
```

[![WhatsApp Group](https://img.shields.io/badge/Join_WhatsApp-black?style=for-the-badge&logo=whatsapp&logoColor=white)](https://chat.whatsapp.com/KxwEnQlmjWdAAQCfUaKgu4)
