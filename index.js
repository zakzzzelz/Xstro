import { readdir } from 'fs/promises';
import { extname, join, dirname } from 'path';
import { fileURLToPath } from 'url';
import connect from './lib/bot.js';
import config from './config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const { DATABASE } = config;

const log = (type, msg) => console.log(`[${type}] ${msg}`);

async function loadFiles(dir) {
	try {
		const files = await readdir(dir, { withFileTypes: true });

		for (const file of files) {
			const fullPath = join(dir, file.name);

			if (file.isDirectory()) {
				await loadFiles(fullPath);
				continue;
			}

			if (file.isFile() && extname(file.name) === '.js') {
				try {
					await import(`file://${fullPath}`);
				} catch (err) {
					log('ERROR', `File: ${file.name} | Line: ${err.line || 'unknown'} | ${err.message}`);
				}
			}
		}
	} catch (err) {
		log('ERROR', `Dir ${dir}: ${err.message}`);
	}
}

async function startBot() {
	log('Starting XSTRO MD');

	try {
		await DATABASE.sync().catch(err => log('ERROR', `Database: ${err.message}`));

		await loadFiles(join(__dirname, 'lib/sql'));
		await loadFiles(join(__dirname, 'plugins'));
		await connect();

		log('Application Running');
	} catch (err) {
		log('ERROR', `Boot: ${err.message}`);
	}
}

startBot();

process.on('SIGINT', () => {
	DATABASE.close();
	process.exit();
});
