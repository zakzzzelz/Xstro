# `xstro-md` Simple WhatsApp Bot

`xstro-md` is an open-source WhatsApp bot written and enhanced by [AstroX11](https://github.com/AstroX11) to facilitate lazy WhatsApp users like yourself and me. The original purpose of this project was, personally for me, to develop my JavaScript skills. Since you guys like my work, I decided to continue improving and maintaining this project. I hope someone will sponsor me one day, lol.

![npm](https://img.shields.io/npm/dm/xstro-utils)
![Forks](https://img.shields.io/github/forks/AstroX11/Xstro?style=social)
![Stars](https://img.shields.io/github/stars/AstroX11/Xstro?style=social)

> [!Important]
> If you want to modify the source code, you are free to do so according to the license. However, I will not take responsibility for any unethical actions you take using this software, as it was originally made for educational purposes. I strongly oppose any form of misuse, abuse, or threats.

## Offical Documentation

[![Fork Repo](https://img.shields.io/badge/Fork_Repo-black?style=for-the-badge&logo=github&logoColor=white)](https://github.com/AstroX11/Xstro/fork)  

[![Get Session](https://img.shields.io/badge/Get_Session-black?style=for-the-badge&logo=whatsapp&logoColor=white)](https://bit.ly/41mQBbY)

> [!Note]
> Session ID created by XstroSession, encrypted with SessionMaker Crypto, and stored on Koyeb. Only Xstro can unlock it. Two repository links provided for creating your own session. Keep your session ID safe. I am not a cybersecurity expert.

### Custom Session

* [Download & Install Node.js](https://nodejs.org/en)
* [Download & Install Git](https://git-scm.com/)
* Run `node -v` on your terminal.
* Create a folder, and open your terminal on that folder and run the below.

```bash
npm i -g yarn
```

`XstroSession`

```bash
git clone https://github.com/AstroX11/XstroSession
yarn install
npm start
```

`Session Crypto`

```bash
git clone https://github.com/AstroX11/session-maker-crypto
yarn install
npm start
```

## Deployments

### Heroku Deploy

* [Deploy Now](https://www.heroku.com/deploy?template=https://github.com/AstroX11/Xstro)
* Once you tap the URL above, fill in the `vars` such as `SESSION_ID`,`BOT_INFO`, `SUDO`, `STICKER_PACK`, `WARN_COUNT`, and `TIME_ZONE`.
* Click on the `Deploy` button to install and deploy the bot to Heroku.
* [Watch Video Tutorial](https://tinyurl.com/28ekfssb)

### Koyeb Deploy

* [Deploy Now](https://app.koyeb.com/services/deploy?type=git&builder=dockerfile&repository=https://github.com/AstroX11/Xstro&branch=master&name=xstro&env%5BSESSION_ID%5D=null&env%5BSUDO%5D=null&env%5BBOT_INFO%5D=αѕтяσχ11;χѕтяσ%20м∂&env%5BSTICKER_PACK%5D=мα∂є%20бу;χѕтяσ%20мυℓтι%20∂єνι¢є%20вσт&env%5BWARN_COUNT%5D=3&env%5BTIME_ZONE%5D=Africa/Lagos)
* Once you tap the URL above, fill in the `vars` such as `SESSION_ID`,`BOT_INFO`, `SUDO`, `STICKER_PACK`, `WARN_COUNT`, and `TIME_ZONE`.
* If you are not an advanced koyeb user, just tap on the `deploy` button, after you have filled the variables and aviod any necessary options that "may" or "will" alter the pre and post deployment process.
* [Watch Video Tutorial](https://tinyurl.com/28ekfssb)

### Render Deploy

* [Deploy Now](https://render.com/deploy?repo=https://github.com/AstroX11/Xstro)
* Once you tap the URL above, fill in the `vars` such as `SESSION_ID`,`BOT_INFO`, `SUDO`, `STICKER_PACK`, `WARN_COUNT`, and `TIME_ZONE`.
* Tap on the `Deploy Blueprint` button, the wait for the bot to deploy and start running.
* Once you have deployed the bot, copy the `URL` of the deployed blueprint.
* If you do not have a `betterstack` account then [Create A Better Stack Account](https://betterstack.com/users/sign-up) or [Login if you already have one](https://betterstack.com/users/sign-in#magic).
* Once you are in, tap on the `create monitor` button and scroll down to the box that say you should put `url to monitor` it could be different and paste the `URL` in the box and tap on `create monitor`.
* This keeps the bot Alive by pinging it every 5mins.
* [Watch Video Tutorial](https://tinyurl.com/28ekfssb)

### Panel Deploy

* [Panel Deployment](https://github.com/AstroX11/Xstro/wiki/Panel-Support)

### Windows/Linux/MacOS Deploy

#### 1. Install Node.js

* **Windows**: [Download](https://nodejs.org/) and install. Verify:

  ```bash
  node -v
  npm -v
  ```

* **Linux**:

  ```bash
  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
  sudo apt install -y nodejs
  node -v
  npm -v
  ```

* **macOS**:

  ```bash
  brew install node
  node -v
  npm -v
  ```

#### 2. Install FFmpeg

* **Windows**: [Download](https://ffmpeg.org/download.html), extract, and add `bin` to PATH. Verify:

  ```bash
  ffmpeg -version
  ```

* **Linux**:

  ```bash
  sudo apt update && sudo apt install ffmpeg
  ffmpeg -version
  ```

* **macOS**:

  ```bash
  brew install ffmpeg
  ffmpeg -version
  ```

#### 3. Install Yarn

* Install globally using npm:

  ```bash
  npm install -g yarn
  yarn -v
  ```

#### 4. Install Git

* **Windows**: [Download](https://git-scm.com/) and install. Verify:

  ```bash
  git --version
  ```

* **Linux**:

  ```bash
  sudo apt update && sudo apt install git
  git --version
  ```

* **macOS**:

  ```bash
  brew install git
  git --version
  ```

#### 5. Setup

1. Open a terminal.
2. Clone the repo and start:

   ```bash
   git clone https://github.com/AstroX11/Xstro.git
   cd Xstro
   yarn install
   npm start
   ```

### Guide and Support

* _[External Plugins](https://github.com/AstroX11/Xstro/wiki/External-Plugins)_

* _[Render Support](https://github.com/AstroX11/Xstro/wiki/Render-Support)_

* _[Heroku Support](https://github.com/AstroX11/Xstro/wiki/Heroku-Support)_

* _[Windows Support](https://github.com/AstroX11/Xstro/wiki/Windows-Setup)_

* _[Plugin Creation](https://github.com/AstroX11/Xstro/wiki/Plugin-Creation)_

* _[Listener Events](https://github.com/AstroX11/Xstro/wiki/Create-Custom-Listener)_

### Contributing

Want to help? Fork the repo, create a pull request, and ensure everything works.

[![Contribute](https://img.shields.io/badge/CONTRIBUTE-black?style=for-the-badge&logo=github&logoColor=white)](https://github.com/AstroX11/Xstro/blob/master/.github/contributing.md)  
[![Join WhatsApp Group](https://img.shields.io/badge/Join_WhatsApp-black?style=for-the-badge&logo=whatsapp&logoColor=white)](https://chat.whatsapp.com/HIvICIvQ8hL4PmqBu7a2C6)

### Disclaimer

This is my first JavaScript project—expect some bugs. This project is not affiliated with WhatsApp. For official WhatsApp, visit [whatsapp.com](https://whatsapp.com).
