import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
let config;
dotenv.config();

const toBool = x => x === 'true';
const DATABASE_URL = process.env.DATABASE_URL || './database.db';
export default config = {
	BASE_API_URL: process.env.BASE_API_URL || 'https://server-di1w.onrender.com',
	API_KEY: process.env.API_KEY || 'astro_fx-k56DdhdS7@gifted_api',
	SESSION_ID: process.env.SESSION_ID || '',
	BOT_INFO: process.env.BOT_INFO || 'ᴀsᴛʀᴏ;xsᴛʀᴏ-ᴍᴅ',
	PREFIX: process.env.PREFIX || '.',
	SUDO: process.env.SUDO || '',
	STICKER_PACK: process.env.STICKER_PACK || 'ᴀsᴛʀᴏ;xsᴛʀᴏ-ᴍᴅ',
	AUTO_READ: toBool(process.env.AUTO_READ) || false,
	AUTO_STATUS_READ: toBool(process.env.AUTO_STATUS_READ) || false,
	MODE: process.env.MODE || 'private',
	CMD_REACT: process.env.CMD_REACT || true,
	LOGGER: process.env.LOGGER || false,
	VERSION: require('./package.json').version,
	DATABASE:
		DATABASE_URL === './database.db'
			? new Sequelize({
					dialect: 'sqlite',
					storage: DATABASE_URL,
					logging: false,
			  })
			: new Sequelize(DATABASE_URL, {
					dialect: 'postgres',
					ssl: true,
					protocol: 'postgres',
					dialectOptions: {
						native: true,
						ssl: { require: true, rejectUnauthorized: false },
					},
					logging: false,
			  }),
};
