import dotenv from 'dotenv';
import connect from './lib/client.js';
import config from './config.js';
import loadFiles from './lib/utils.js';
import getSession from './lib/session.js';

dotenv.config();

async function startBot() {
	try {
		console.log('XSTRO MD');
		await loadFiles();
		await config.DATABASE.sync();
		await getSession();
		await connect();
	} catch (err) {
		console.log('ERROR:\n' + err.message + '');
	}
}

startBot();
