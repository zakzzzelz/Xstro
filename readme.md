## WhatsApp Bot In Javascript Baileys Web API

<p>Xstro is a simple WhatsApp bot I made to make using WhatsApp faster and easier. It fully depends on the XSTRO API where all the functionality is processed. I used Axios to keep it lightweight and fast. All you need is a decent internet connection from your server.
Powered By Baileys Open Source WhatsApp Web API</p>

![npm](https://img.shields.io/npm/dm/xstro)


## SETUP

### Fork the Repo

First, Fork your own copy of the repo to your GitHub account.

[![FORK REPO](https://img.shields.io/badge/FORK_REPO-100000?style=for-the-badge&logo=github&logoColor=white&labelColor=black&color=black)](https://github.com/AstroX11/Xstro/fork)

### Get a Session

Get Session ID from render server.

[![GET SESSION](https://img.shields.io/badge/GET_SESSION-100000?style=for-the-badge&logo=render&logoColor=white&labelColor=black&color=black)](https://bit.ly/41mQBbY)

### NOTICE

I’m not responsible for you messing around and getting your account banned. As long as you don’t modify the source code to fit your idiotic needs, you’re fine. But seriously, don’t go spamming others. I’m tired of repeating this.

### NODE JS DEPLOYMENT PLATFORMS

#### Render Support

##### 1. Account Setup and BetterStack

Xstro Fully Supports Render, in order to deploy xstro on render without errors and timeout you need a [Render](https://dashboard.render.com/register) and [betterstack](https://betterstack.com) account, render for deployment and betterstack to montioring, it is very important to use betterstack to monitor your WebApp, don't come asking why is my bot not alive on render after 5 mins, this is the reason.

##### 2. Database URL Setup (Optional)

This optionally close to useless, unless you are ready to pay for a faster postgre database rather than use Sqlite3 local database then I'm with you, the database is used to store your session and other configurations, if you don't use a postgre database you can easily lose all your settings if the bot is redeployed or deployed to another platform, acquire a database url from the [Render Dashboard](https://dashboard.render.com/new/database)

##### 3. Blueprint Deployment on Render

I have setup a Docker build container, thanks to Github actions all our Docker builds are passing and a success, the blueprint deployment will automatically configure render to suite xstro environment on the blue print configureations, make sure to use **PORT:8000** if you don't the application will eventually crash causing a build failure on render. Now [Deploy BluePrint](https://render.com/deploy?repo=https://github.com/AstroX11/Xstro)

---

#### Heroku Support, Deployments, Dynos & Warnings

##### 1. Create An Heroku Account

[Create an Heroku Account](https://signup.heroku.com/) if you don't have any, make sure to put in your credit card deatils in order to create an heroku app, once done I recommend you use eco dyno to save money.

##### 2. Xstro App Setup

Once you have done that we must ensure that Xstro is built as an [Heroku Contanier](https://devcenter.heroku.com/articles/container-registry-and-runtime), to make sure all required environment files are supported, [Deploying to Heroku](https://www.heroku.com/deploy?template=https://github.com/AstroX11/Xstro) we must make sure we fill in the variables correctly, warning: wrong variables, bad runtime, don't come complaining to me about error you caused!!! kid.

##### 3. Very Important

On Heroku make sure to to choose worker as runtime else the application would crash, I don't know how to support heroku web, it's not my code it's their platform. I think I have this the time I was editing this by then 2 weeks old readme

---

#### Koyeb Deployment

I have no Idea, Koyeb Banned Me.

---

#### Offical Panel Support

It's been long await jackass, Now Xstro Support's Panel deployment, on your panel you can create an `index.js` file and make sure it's on the root of your panel, once done make sure to fill in the variables in the in the `CONFIG` constant, in must be in this format `SESSION_ID: 'Xstro_something'` do not remove the single quote, once you have done that then run the panel script, this will automatically install Xstro and all it's file, don't worry about error, check our workflow to see how xstro passess the panel test actions.

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
	const cloneResult = spawnSync('git', ['clone', CONFIG.REPO_URL, CONFIG.PROJECT_DIR], {
		stdio: 'inherit',
		shell: true, // For Windows compatibility
	});
	if (cloneResult.error || cloneResult.status !== 0) {
		handleError('Failed to clone repository.', cloneResult.error);
	}
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
	const installResult = spawnSync('yarn', ['install'], {
		cwd: path.resolve(CONFIG.PROJECT_DIR),
		stdio: 'inherit',
		shell: true, // Ensure compatibility with Windows
	});
	if (installResult.error || installResult.status !== 0) {
		handleError('Failed to install dependencies.', installResult.error);
	}
}

function startApplication() {
	console.log('Starting application...');
	const startResult = spawnSync('pm2', ['start', CONFIG.MAIN_SCRIPT, '--name', CONFIG.APP_NAME, '--attach'], {
		cwd: path.resolve(CONFIG.PROJECT_DIR),
		stdio: 'inherit',
		shell: true, // Ensure compatibility with Windows
	});

	if (startResult.error || startResult.status !== 0) {
		console.error('PM2 start failed. Falling back to Node.js.');
		const nodeResult = spawnSync('node', [CONFIG.MAIN_SCRIPT], {
			cwd: path.resolve(CONFIG.PROJECT_DIR),
			stdio: 'inherit',
			shell: true,
		});
		if (nodeResult.error || nodeResult.status !== 0) {
			handleError('Failed to start the application with Node.js.', nodeResult.error);
		}
	}
}

function XstroPanel() {
	if (!existsSync(CONFIG.PROJECT_DIR)) cloneRepository();
	writeEnvFile();
	installDependencies();
	startApplication();
}

XstroPanel();
```

###### Warning

Don't change a single line of code you nerd, just put your session id and run the botto, if it's slow then upgrade with your hard earn money and get better performance, peace.

---

#### Windows Support

#### 1. Install Node.js

NodeJs is the core of this project, not installing it on windows make you dumb, so in order to have nodejs download this version I used to build Xstro from [Here](https://nodejs.org/dist/v22.12.0/node-v22.12.0-x64.msi).

#### 2. Installation

Once you have setup NodeJs make sure to restart your pc, then install [git](https://git-scm.com/download/win), once done copy the following below and paste in powershell.

```bash
npm i -g pm2 yarn
git clone https://github.com/AstroX11/Xstro.git
cd Xstro
yarn install
```

#### 3. Configuration

If you don't trust the terminal (noobs) then go to the folder where the git file was downloaded to and create a file named `.env` once you have done that copy the line below and paste in there, remove `echo` from the line and edit the vars.

```bash
echo "SESSION_ID=null
CMD_REACT=true
BOT_INFO=Astro;Xstro-Md;
MODE=private
AUTO_STATUS_READ=false
AUTO_READ=false
STICKER_PACK=Astro;Xstro
PREFIX=./," > config.env
```

#### 4. Start the Bot

```bash
npm start
```

#### 5. Stop the Bot

```bash
npm stop
```

## CONTRIBUTING

If you want to help out or contribute to the project, feel free to fork the repo and create a pull request. Just don’t break anything.

[![Contribute](https://img.shields.io/badge/CONTRIBUTE-black?style=for-the-badge&logo=github&logoColor=white)](https://github.com/AstroX11/Xstro/blob/master/.github/contributing.md)

[![Join WhatsApp Group](https://img.shields.io/badge/Join_WhatsApp-black?style=for-the-badge&logo=whatsapp&logoColor=white)](https://chat.whatsapp.com/HIvICIvQ8hL4PmqBu7a2C6)
