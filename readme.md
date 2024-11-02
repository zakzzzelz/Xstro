## XSTRO-MD-WhatsApp Bot

A small, simple, lightweight open-source WhatsApp bot.

### SETUP

1. Fork Your Copy <br> [![Fork](https://img.shields.io/badge/FORK-black?style=for-the-badge&logo=github&logoColor=white)](https://github.com/ASTRO-X10/xstro-md/fork)

2. Get Session ID <br> [![Session](https://img.shields.io/badge/SESSION-100000?style=for-the-badge&logo=scan&logoColor=white&labelColor=black&color=black)](https://your-qr-endpoint)

## Deployment Options

### Render Deployment

1. Create A Render account<br> [![Create Render Account](https://img.shields.io/badge/CREATE-black?style=for-the-badge&logo=render&logoColor=white)](https://render.com)

2. Config Environment

   - Set `DATABASE_URL`
   - Add Render API Key

3. Run Deployment<br> [![Deploy to Render](https://img.shields.io/badge/DEPLOY-black?style=for-the-badge&logo=render&logoColor=white)](https://render.com/deploy)

### Koyeb Deployment

1. Create Your Koyeb Account<br> [![Create Koyeb Account](https://img.shields.io/badge/CREATE-black?style=for-the-badge&logo=koyeb&logoColor=white)](https://koyeb.com)

2. Setup Enviroment

   - Set `DATABASE_URL`
   - Add Koyeb API Key

3. Run Deployment <br>[![Deploy to Koyeb](https://img.shields.io/badge/DEPLOY-black?style=for-the-badge&logo=koyeb&logoColor=white)](https://koyeb.com/deploy)

### Local PC

```bash
git clone https://github.com/ASTRO-X10/xstro-md.git
```

```bash
cd xstro-md
npm install
```

```bash
cat << EOF > config.env
VPS = true
SESSION_ID =
SUDO =
PREFIX = .
MODE = private
LOG_MSG = true
EOF
```

```bash
npm start
```

### Configs

| Parameter    | Description                | Example           |
| ------------ | -------------------------- | ----------------- |
| SESSION_ID   | Unique instance ID         | `"bot-session"`   |
| DATABASE_URL | Database connection string | `"postgre://..."` |
| SUDO         | Admin user IDs             | `"1234567890"`    |
| PREFIX       | Command prefix             | `"."`             |
| MODE         | Operational mode           | `"private"`       |
| LOG_MSG      | Message logging toggle     | `true`            |

### Support

Join our community for chats, updates, and help:

[![WhatsApp Channel](https://img.shields.io/badge/WhatsApp%20Channel-white?style=for-the-badge&logo=whatsapp&logoColor=black)](https://whatsapp.com/channel/0029VasMxnC7Noa3nZk9QA3G)
