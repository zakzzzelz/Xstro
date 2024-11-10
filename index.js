import { readdir } from 'fs/promises';
import { extname, join, dirname } from 'path';
import { fileURLToPath } from 'url';
import connect from './lib/bot.js';
import config from './config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const { DATABASE } = config;

const loadFiles = async directory => {
	const files = await readdir(directory);
	const jsFiles = files.filter(file => extname(file) === '.js');
	return Promise.all(jsFiles.map(file => import(`file://${join(directory, file)}`)));
};

async function startBot() {
	await loadFiles(join(__dirname, '/lib/sql/'));
	console.log('DB Syncing...');
	await DATABASE.sync();
	console.log('Installing Plugins...');
	await loadFiles(join(__dirname, '/plugins/'));
	console.log('External Modules Installed');
	return await connect();
}
startBot();
