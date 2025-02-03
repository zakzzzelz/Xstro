# `xstro-md`: A Simple WhatsApp Bot

xstro-md is an open-source WhatsApp bot developed by [AstroX11](https://github.com/AstroX11) to help you manage WhatsApp with ease. Originally a personal project to improve JavaScript skills, it has grown with community support. (I hope someone sponsors me one day!)

> [!Important]  
> You can modify the source code under the provided license. However, I am not responsible for any unethical use of this software. It was built for educational purposes, so please use it responsibly.

[![npm](https://img.shields.io/npm/dm/xstro-utils?style=for-the-badge)](https://www.npmjs.com/package/xstro-utils)  
[![Forks](https://img.shields.io/github/forks/AstroX11/Xstro?style=for-the-badge)](https://github.com/AstroX11/Xstro/network/members)  
[![Stars](https://img.shields.io/github/stars/AstroX11/Xstro?style=for-the-badge)](https://github.com/AstroX11/Xstro/stargazers)

[![Fork Repository](https://img.shields.io/badge/Fork_Repo-blue?style=for-the-badge&logo=github)](https://github.com/AstroX11/Xstro/fork)
[![Get Session](https://img.shields.io/badge/Get_Session-black?style=for-the-badge&logo=react)](https://bit.ly/41mQBbY)
[![Join WhatsApp Support Group](https://img.shields.io/badge/Support_Group-black?style=for-the-badge&logo=whatsapp)](https://chat.whatsapp.com/HIvICIvQ8hL4PmqBu7a2C6)

## Table of Contents

- [Custom Session Setup](#custom-session-setup)
- [Deployments](#deployments)
  - [Heroku Deploy](#heroku-deploy)
  - [Koyeb Deploy](#koyeb-deploy)
  - [Render Deploy](#render-deploy)
  - [Panel Deploy](#panel-deploy)
  - [Local Deployment (Windows/Linux/macOS)](#local-deployment-windowslinuxmacos)
    - [Install Node.js](#install-nodejs)
    - [Install FFmpeg](#install-ffmpeg)
    - [Install Yarn](#install-yarn)
    - [Install Git](#install-git)
    - [Setup and Run](#setup-and-run)
- [Guides and Support](#guides-and-support)
- [Contributing](#contributing)
- [Disclaimer](#disclaimer)

## Custom Session Setup

1. [Install Node.js](https://nodejs.org/en)
2. [Install Git](https://git-scm.com/)
3. Check your Node.js installation:

   ```bash
   node -v
   ```

4. Create a folder, open your terminal in that folder, and follow these steps:
   - [Session Source](https://github.com/AstroX11/XstroSession)
   - [Session Crypto](https://github.com/AstroX11/session-maker-crypto)

## Deployments

### Heroku Deploy

1. Click [Deploy Now](https://www.heroku.com/deploy?template=https://github.com/AstroX11/Xstro).
2. Fill in the variables: `SESSION_ID`, `BOT_INFO`, `SUDO`, `STICKER_PACK`, `WARN_COUNT`, and `TIME_ZONE`.
3. Click **Deploy** to set up the bot.
4. [Watch Video Tutorial](https://tinyurl.com/2yrycr7h)

### Koyeb Deploy

1. Click [Deploy Now](https://app.koyeb.com/services/deploy?type=git&builder=dockerfile&repository=https://github.com/AstroX11/Xstro&branch=master&name=xstro&env%5BSESSION_ID%5D=null&env%5BSUDO%5D=null&env%5BBOT_INFO%5D=αѕтяσχ11;χѕтяσ%20м∂&env%5BSTICKER_PACK%5D=мα∂є%20бу;χѕтяσ%20мυℓтι%20∂єνι¢є%20вσт&env%5BWARN_COUNT%5D=3&env%5BTIME_ZONE%5D=Africa/Lagos).
2. Fill in the required variables.
3. Click **Deploy** (avoid altering default settings).
4. [Watch Video Tutorial](https://tinyurl.com/2yrycr7h)

### Render Deploy

1. Click [Deploy Now](https://render.com/deploy?repo=https://github.com/AstroX11/Xstro).
2. Enter the required variables: `SESSION_ID`, `BOT_INFO`, `SUDO`, `STICKER_PACK`, `WARN_COUNT`, and `TIME_ZONE`.
3. Click **Deploy Blueprint** and wait for the bot to start.
4. Copy the deployed URL.
5. To keep the bot alive, create a monitor by signing up or logging in to Better Stack:
   - [Create an Account](https://betterstack.com/users/sign-up)
   - [Log In](https://betterstack.com/users/sign-in#magic)
6. In Better Stack, create a monitor by pasting the deployed URL (it pings every 5 minutes).
7. [Watch Video Tutorial](https://tinyurl.com/2yrycr7h)

### Panel Deploy

Refer to the [Panel Deployment documentation](https://github.com/AstroX11/Xstro/wiki/Panel-Support).

### Local Deployment (Windows/Linux/macOS)

#### Install Node.js

- **Windows:**  
  [Download Node.js](https://nodejs.org/) and install it. Verify with:

  ```bash
  node -v
  npm -v
  ```

- **Linux:**

  ```bash
  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
  sudo apt install -y nodejs
  node -v
  npm -v
  ```

- **macOS:**

  ```bash
  brew install node
  node -v
  npm -v
  ```

#### Install FFmpeg

- **Windows:**  
  [Download FFmpeg](https://ffmpeg.org/download.html), extract it, and add the `bin` folder to your PATH. Verify with:

  ```bash
  ffmpeg -version
  ```

- **Linux:**

  ```bash
  sudo apt update && sudo apt install ffmpeg
  ffmpeg -version
  ```

- **macOS:**

  ```bash
  brew install ffmpeg
  ffmpeg -version
  ```

#### Install Yarn

Install Yarn globally:

```bash
npm install -g yarn
yarn -v
```

#### Install Git

- **Windows:**  
  [Download Git](https://git-scm.com/) and install it. Verify with:

  ```bash
  git --version
  ```

- **Linux:**

  ```bash
  sudo apt update && sudo apt install git
  git --version
  ```

- **macOS:**

  ```bash
  brew install git
  git --version
  ```

#### Setup and Run

1. Open a terminal.
2. Clone the repository and start the bot:

   ```bash
   git clone https://github.com/AstroX11/Xstro.git
   cd Xstro
   yarn install
   npm start
   ```

## Guides and Support

- [External Plugins](https://github.com/AstroX11/Xstro/wiki/External-Plugins)
- [Render Support](https://github.com/AstroX11/Xstro/wiki/Render-Support)
- [Heroku Support](https://github.com/AstroX11/Xstro/wiki/Heroku-Support)
- [Windows Setup](https://github.com/AstroX11/Xstro/wiki/Windows-Setup)
- [Plugin Creation](https://github.com/AstroX11/Xstro/wiki/Plugin-Creation)
- [Create Custom Listener](https://github.com/AstroX11/Xstro/wiki/Create-Custom-Listener)

## Contributing

Want to help? Fork the repository, create a pull request, and make sure everything works.

[Contribute Here](https://github.com/AstroX11/Xstro/blob/master/.github/contributing.md)

## Disclaimer

This is my first JavaScript project—so expect some bugs. This project is not affiliated with WhatsApp. For official WhatsApp information, visit [whatsapp.com](https://whatsapp.com).
