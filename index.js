import { promises as fs } from 'fs';
import { extname, join } from 'path';
import { DATABASE } from './config.js';
import connect from './lib/bot.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createSession } from './lib/client/session.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
global.__basedir = __dirname;

const readAndRequireFiles = async directory => {
	try {
		const files = await fs.readdir(directory);
		return Promise.all(
			files
				.filter(file => extname(file).toLowerCase() === '.js')
				.map(async file => {
					const modulePath = join(directory, file);
					const moduleUrl = new URL(`file://${modulePath}`).href;
					return import(moduleUrl);
				}),
		);
	} catch (error) {
		console.error('File Error:', error);
		throw error;
	}
};

async function initialize() {
//	await createSession();
	const dbPath = join(__dirname, '/lib/');
	const pluginsPath = join(__dirname, '/plugins/');

	await readAndRequireFiles(dbPath);
	console.log('Syncing Database');

	await DATABASE.sync();

	console.log('⬇  Installing Plugins...');
	await readAndRequireFiles(pluginsPath);
	console.log('✅ Plugins Installed!');
	return await connect();
}

initialize().catch(console.error);
