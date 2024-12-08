import dotenv from 'dotenv';
dotenv.config();
import { Sequelize } from 'sequelize';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const DATABASE_URL = process.env.DATABASE_URL || './database.db';
const config = {
	SESSION_ID: process.env.SESSION_ID || '',
	PREFIX: process.env.PREFIX || '.',
	SUDO: process.env.SUDO || '',
	// MENU_IMAGE_URL: 'https://avatars.githubusercontent.com/u/188756392?v=4', // add your images url if u want bot menu with image 
    //     MENU_DESIGN: 1, // 1 = Menu with image, 2 = Menu without image  pick style 1 if u want menu with image 
	BOT_INFO: process.env.BOT_INFO || '𝙰𝚜𝚝𝚛𝚘;𝚇𝚜𝚝𝚛𝚘-𝙱𝚘𝚝',
	STICKER_PACK: process.env.STICKER_PACK || 'xʂƚɾσ;Ⴆσƚ',
	HEROKU_API_KEY: process.env.HEROKU_API_KEY || '',
	HEROKU_APP_NAME: process.env.HEROKU_APP_NAME || '',
	MUTE_MSG: process.env.MUTE_MSG || '```Group has been muted, due to AutoMute```',
	UN_MUTE_MSG: process.env.UN_MUTE_MSG || '```Group is now unmuted, due to AutoUnMute```',
	READ_CMD: process.env.READ_CMD || true,
	AUTO_READ: process.env.AUTO_READ || false,
	AUTO_STATUS_READ: process.env.AUTO_STATUS_READ || false,
	CMD_REACT: process.env.CMD_REACT || true,
	MODE: process.env.MODE || 'private',
	TIME_ZONE: process.env.TZ || process.env.TIME_ZONE || 'Africa/Lagos',
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
	BASE_API_URL: 'https://xstro-api-ec3ad328e76f.herokuapp.com',
};

export default config;
