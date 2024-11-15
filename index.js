import { readdir } from 'fs/promises';
import { extname, join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createSession } from './lib/session.js';
import connect from './lib/bot.js';
import config from './config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const { DATABASE } = config;

const loadFiles = async dir => Promise.all((await readdir(dir)).filter(file => extname(file) === '.js').map(file => import(`file://${join(dir, file)}`)));

(async function startBot() {
	console.log('Xstro Multi Device');
	try {
		await createSession();
		await loadFiles(join(__dirname, 'lib/sql'));
		await DATABASE.sync();
		await loadFiles(join(__dirname, 'plugins'));
		return await connect();
	} catch (error) {
		throw new Error(`Boot Error: ${error.message}`);
	}
})();
