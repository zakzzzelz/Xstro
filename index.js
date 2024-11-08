import { promises as fs } from 'fs';
import { extname, join, dirname } from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { DATABASE } from './config.js';
import connect from './lib/bot.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const loadFiles = async directory => {
	const files = await fs.readdir(directory);
	const jsFiles = files.filter(file => extname(file) === '.js');
	return Promise.all(jsFiles.map(file => import(`file://${join(directory, file)}`)));
};

async function initialize() {
	await loadFiles(join(__dirname, '/lib/db/'));
	console.log('DB Syncing...');
	await DATABASE.sync();
	console.log('Installing Plugins...');
	await loadFiles(join(__dirname, '/plugins/'));
	console.log('External Modules Installed');
	return connect();
}

http
	.createServer((_, res) => {
		res.writeHead(200, { 'Content-Type': 'text/plain' });
		res.end('Bot is alive');
	})
	.listen(8000, initialize().catch(console.error));
