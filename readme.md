## WhatsApp Bot In Javascript Baileys Web API

<p>Xstro is a simple WhatsApp bot I made to make using WhatsApp faster and easier. It fully depends on the XSTRO API where all the functionality is processed. I used Axios to keep it lightweight and fast. All you need is a decent internet connection from your server.  
Powered By Baileys Open Source WhatsApp Web API.</p>

![npm](https://img.shields.io/npm/dm/xstro)

---

## SETUP

### Fork the Repo

First, fork your own copy of the repo to your GitHub account.

[![FORK REPO](https://img.shields.io/badge/FORK_REPO-100000?style=for-the-badge&logo=github&logoColor=white&labelColor=black&color=black)](https://github.com/AstroX11/Xstro/fork)

### Get a Session

Get the Session ID from the render server.

[![GET SESSION](https://img.shields.io/badge/GET_SESSION-100000?style=for-the-badge&logo=render&logoColor=white&labelColor=black&color=black)](https://bit.ly/41mQBbY)

---

### NOTICE

I’m not responsible for you messing around and getting your account banned. As long as you don’t modify the source code to fit your idiotic needs, you’re fine. Seriously, don’t spam others—I'm tired of repeating this.

---

## NODE JS DEPLOYMENT PLATFORMS

### Render Support

#### 1. Account Setup and BetterStack

Xstro fully supports Render. To deploy Xstro on Render without errors and timeouts:  
- **Register a [Render Account](https://dashboard.render.com/register)**.  
- **Use [BetterStack](https://betterstack.com)** for monitoring.  

BetterStack ensures the bot stays alive. Don’t ask, *“Why is my bot dead after 5 mins on Render?”*—this is why.

#### 2. Database URL Setup (Optional)

PostgreSQL Database (Optional):  
- Useful if you prefer a faster database instead of local `Sqlite3`.  
- Prevents loss of session and configurations on redeployment.  
- Acquire the database URL from the [Render Dashboard](https://dashboard.render.com/new/database).

#### 3. Blueprint Deployment on Render

Thanks to GitHub Actions, all Docker builds are tested and successful.  
- Use **PORT:8000** to avoid crashes.  
- [Deploy BluePrint](https://render.com/deploy?repo=https://github.com/AstroX11/Xstro)

---

### Heroku Support, Deployments, Dynos & Warnings

#### 1. Create a Heroku Account

[Create a Heroku Account](https://signup.heroku.com/) and add your credit card details. Use **eco dynos** to save money.

#### 2. Xstro App Setup

Ensure Xstro is built as a [Heroku Container](https://devcenter.heroku.com/articles/container-registry-and-runtime).  
- [Deploy to Heroku](https://www.heroku.com/deploy?template=https://github.com/AstroX11/Xstro).  
- Fill variables correctly. **Wrong configs = runtime failure. Don’t blame me.**

#### 3. Important

Choose **worker** as the runtime. If you pick web, the application **will crash**—Heroku’s issue, not mine.

---

### Koyeb Deployment

I have no idea—Koyeb banned me.

---

### Official Panel Support

Xstro now supports panel deployment.  
- Create an `index.js` file at the root of your panel.  
- Add variables in the correct format (`SESSION_ID: 'Xstro_something'`).  
- Run the script below to install and start Xstro:

```javascript
const { existsSync, writeFileSync } = require('node:fs');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const CONFIG = {
	SESSION_ID: '', // Put your Session ID Here kid!
	PROJECT_DIR: 'Xstro',
	REPO_URL: 'https://github.com/AstroX11/Xstro.git',
	APP_NAME: 'Xstro',
	MAIN_SCRIPT: 'index.js',
};

function handleError(message, error) {
	console.error(message, error);
	process.exit(1);
}

function cloneRepository() {
	console.log('Cloning repository...');
	const cloneResult = spawnSync('git', ['clone', CONFIG.REPO_URL, CONFIG.PROJECT_DIR], { stdio: 'inherit', shell: true });
	if (cloneResult.error || cloneResult.status !== 0) handleError('Failed to clone repository.', cloneResult.error);
}

function writeEnvFile() {
	try {
		writeFileSync(path.join(CONFIG.PROJECT_DIR, '.env'), `SESSION_ID=${CONFIG.SESSION_ID}`);
	} catch (error) {
		handleError('Failed to write .env file', error);
	}
}

function installDependencies() {
	console.log('Installing dependencies...');
	const installResult = spawnSync('yarn', ['install'], { cwd: path.resolve(CONFIG.PROJECT_DIR), stdio: 'inherit', shell: true });
	if (installResult.error || installResult.status !== 0) handleError('Failed to install dependencies.', installResult.error);
}

function startApplication() {
	console.log('Starting application...');
	const startResult = spawnSync('pm2', ['start', CONFIG.MAIN_SCRIPT, '--name', CONFIG.APP_NAME, '--attach'], {
		cwd: path.resolve(CONFIG.PROJECT_DIR),
		stdio: 'inherit',
		shell: true,
	});
	if (startResult.error || startResult.status !== 0) handleError('Failed to start the application.', startResult.error);
}

function XstroPanel() {
	if (!existsSync(CONFIG.PROJECT_DIR)) cloneRepository();
	writeEnvFile();
	installDependencies();
	startApplication();
}

XstroPanel();
```

**Warning**: Don’t change any code—just add your Session ID and run the bot.

---

## WINDOWS SUPPORT

### 1. Install Node.js

Download Node.js v22.12.0 [here](https://nodejs.org/dist/v22.12.0/node-v22.12.0-x64.msi). Restart your PC after installation.

### 2. Installation

Install Git, then paste the following commands in PowerShell:

```bash
npm i -g pm2 yarn
git clone https://github.com/AstroX11/Xstro.git
cd Xstro
yarn install
```

### 3. Configuration

If you don’t trust the terminal, create a `.env` file manually and paste:

```bash
SESSION_ID=null
CMD_REACT=true
BOT_INFO=Astro;Xstro-Md;
MODE=private
AUTO_STATUS_READ=false
AUTO_READ=false
STICKER_PACK=Astro;Xstro
PREFIX=./,
```

### 4. Start the Bot

```bash
npm start
```

### 5. Stop the Bot

```bash
npm stop
```

---

## CONTRIBUTING

Want to help? Fork the repo and create a pull request. Don’t break anything.

[![Contribute](https://img.shields.io/badge/CONTRIBUTE-black?style=for-the-badge&logo=github&logoColor=white)](https://github.com/AstroX11/Xstro/blob/master/.github/contributing.md)

[![Join WhatsApp Group](https://img.shields.io/badge/Join_WhatsApp-black?style=for-the-badge&logo=whatsapp&logoColor=white)](https://chat.whatsapp.com/HIvICIvQ8hL4PmqBu7a2C6)

## Disclaimer

I just started leaning Javascript a few months ago and this is my first project. It may have many bugs.

This project is not affiliated, associated, authorized, endorsed by, or in any way officially connected with WhatsApp or any of its subsidiaries or its affiliates. The official WhatsApp website can be found at https://whatsapp.com. "WhatsApp" as well as related names, marks, emblems and images are registered trademarks of their respective owners.
