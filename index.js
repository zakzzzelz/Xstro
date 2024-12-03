import dotenv from 'dotenv';
import connect from './lib/client.js';
import config from './config.js';
import envlogger from './lib/logger.js';
import { join } from 'path';
import { getSession } from './lib/session.js';

dotenv.config();

async function startBot() {
	try {
		envlogger();
		console.log('XSTRO MD');
		await getSession();
		await config.DATABASE.sync();
		await loadFiles(join('plugins/sql'));
		await loadFiles(join('plugins'));
		await connect();
	} catch (err) {
		console.log('ERROR:\n' + err.message + '');
	}
}

startBot();
