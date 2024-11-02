Sure! Here's a more concise version of your document with shorter words:

## XSTRO-MD-WhatsApp Bot

A small, open-source WhatsApp bot.

### SETUP

1. Fork the repo on GitHub: [![Fork](https://img.shields.io/badge/FORK-black?style=for-the-badge&logo=github&logoColor=white)](https://github.com/ASTRO-X10/xstro-md/fork)

2. Get auth keys: [![Session](https://img.shields.io/badge/SESSION-100000?style=for-the-badge&logo=scan&logoColor=white&labelColor=black&color=black)](https://your-qr-endpoint)

## Deployment Options

### Render Deployment

1. Make a Render account: [![Create Render Account](https://img.shields.io/badge/CREATE-black?style=for-the-badge&logo=render&logoColor=white)](https://render.com)

2. Set environment variables:

   - Set `DATABASE_URL`
   - Add Render API keys

3. Start deployment: [![Deploy to Render](https://img.shields.io/badge/DEPLOY-black?style=for-the-badge&logo=render&logoColor=white)](https://render.com/deploy)

### Koyeb Deployment

1. Make a Koyeb account: [![Create Koyeb Account](https://img.shields.io/badge/CREATE-black?style=for-the-badge&logo=koyeb&logoColor=white)](https://koyeb.com)

2. Set environment variables:

   - Set `DATABASE_URL`
   - Add Koyeb API keys

3. Start deployment: [![Deploy to Koyeb](https://img.shields.io/badge/DEPLOY-black?style=for-the-badge&logo=koyeb&logoColor=white)](https://koyeb.com/deploy)

### Local PC

```bash
# Install needed packages
npm i -g pm2
git clone https://github.com/ASTRO-X10/xstro-md.git
cd xstro-md
npm install

# Set up environment
cat << EOF > config.env
VPS = true
SESSION_ID = null
AUTH_FILE = session
SUDO = null
PREFIX = .
MODE = private
LOG_MSG = true
EOF

# Start app
npm start

# Stop process (if needed)
pm2 delete xstro-md
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
