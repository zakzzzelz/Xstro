## XSTRO-MD-WhatsApp Bot

A lightweight, open-source WhatsApp bot.

### SETUP

1. Fork the repository using the GitHub interface:
   [![Fork](https://img.shields.io/badge/FORK-black?style=for-the-badge&logo=github&logoColor=white)](https://github.com/ASTRO-X10/xstro-md/fork)

2. Generate authentication credentials:
   [![Session](https://img.shields.io/badge/SESSION-100000?style=for-the-badge&logo=scan&logoColor=white&labelColor=black&color=black)](https://your-qr-endpoint)

## Deployment Options

### Render Deployment

1. Create a Render account if you haven't already:
   [![Create Render Account](https://img.shields.io/badge/CREATE-black?style=for-the-badge&logo=render&logoColor=white)](https://render.com)

2. Configure environment variables:
   - Set up `DATABASE_URL`
   - Configure Render API credentials

3. Initialize deployment:
   [![Deploy to Render](https://img.shields.io/badge/DEPLOY-black?style=for-the-badge&logo=render&logoColor=white)](https://render.com/deploy)

### Koyeb Deployment

1. Set up a Koyeb account:
   [![Create Koyeb Account](https://img.shields.io/badge/CREATE-black?style=for-the-badge&logo=koyeb&logoColor=white)](https://koyeb.com)

2. Configure environment variables:
   - Initialize `DATABASE_URL`
   - Set up Koyeb API authentication

3. Launch deployment:
   [![Deploy to Koyeb](https://img.shields.io/badge/DEPLOY-black?style=for-the-badge&logo=koyeb&logoColor=white)](https://koyeb.com/deploy)

### Local PC

```bash
# Install required packages
npm i -g pm2
git clone https://github.com/ASTRO-X10/xstro-md.git
cd xstro-md
npm install

# Configure environment
cat << EOF > config.env
VPS = true
SESSION_ID = null
AUTH_FILE = session
SUDO = null
PREFIX = .
MODE = private
LOG_MSG = true
EOF

# Launch application
npm start

# Terminate process (when needed)
pm2 delete xstro-md
```

### Configs

| Parameter | Description | Example |
|-----------|-------------|---------|
| SESSION_ID | Unique instance identifier | `"bot-session"` |
| DATABASE_URL | Database connection string | `"mongodb://..."` |
| SUDO | Administrative user identifiers | `"1234567890"` |
| PREFIX | Command prefix character | `"."` |
| MODE | Operational mode setting | `"private"` |
| LOG_MSG | Message logging toggle | `true` |

### Support

Join our research community for discussions, updates, and support:

[![WhatsApp Channel](https://img.shields.io/badge/WhatsApp%20Channel-white?style=for-the-badge&logo=whatsapp&logoColor=black)](https://whatsapp.com/channel/0029VasMxnC7Noa3nZk9QA3G)
