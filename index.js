import dotenv from 'dotenv';
dotenv.config();
import { readdir } from 'fs/promises';
import { extname, join, dirname } from 'path';
import { fileURLToPath } from 'url';
import connect from './lib/client.js';
import config from './config.js';
import http from 'http';
import { getSession } from './lib/session.js';

http.createServer((req, res) => res.writeHead(200, { 'Content-Type': 'text/html' }).end('<html><body style="background-color:black;"></body></html>')).listen(8000);

const __dirname = dirname(fileURLToPath(import.meta.url));
const log = (type, msg) => console.log(`[${type}] ${msg}`);

async function loadFiles(dir) {
	try {
		const files = await readdir(dir, { withFileTypes: true });
		for (const file of files) {
			const fullPath = join(dir, file.name);
			if (file.isDirectory()) await loadFiles(fullPath);
			else if (extname(file.name) === '.js') await import(`file://${fullPath}`).catch(err => log('ERROR', `File: ${file.name} | ${err.message}`));
		}
	} catch (err) {
		log('ERROR', `Dir ${dir}: ${err.message}`);
	}
}

async function startBot() {
	try {
		console.log('XSTRO MD');
		await getSession()
		await config.DATABASE.sync();
		await loadFiles(join(__dirname, 'lib/sql'));
		await loadFiles(join(__dirname, 'plugins'));
		await connect();
		await config.DATABASE.sync();
	} catch (err) {
		log('ERROR', `Boot: ${err.message}`);
	}
}

startBot();

process.on('SIGINT', () => {
	config.DATABASE.close();
	process.exit();
});
