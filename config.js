import dotenv from 'dotenv';
dotenv.config();

const config = {
	SESSION_ID: process.env.SESSION_ID || '',
	LANG: process.env.LANG || 'en',
	SUDO: process.env.SUDO || '00000000',
	API_ID: process.env.API_ID || 'https://xstro-api-4fb28ece11a9.herokuapp.com',
	BOT_INFO: process.env.BOT_INFO || 'Astro;Xstro_Bot',
	STICKER_PACK: process.env.STICKER_PACK || 'Xstro;Md',
	WARN_COUNT: process.env.WARN_COUNT || 3,
	TIME_ZONE: process.env.TIME_ZONE || 'Africa/Lagos',
	DEBUG: process.env.DEBUG || false,
	VERSION: '1.2.1',
};
export { config };
export default config;
