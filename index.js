import { promises as fs } from 'fs';
import { extname, join, dirname } from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { DATABASE, PORT } from './config.js';
import connect from './lib/bot.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const server = http.createServer();

const loadFiles = async directory => {
	const files = await fs.readdir(directory);
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

server.listen(PORT, async () => {
	await startBot().catch(console.error);
});
