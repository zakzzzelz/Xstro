import utils from 'utils';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { dirname } from 'path';
import config from '../config.js';

const API_URL = 'https://session-am5x.onrender.com';

export async function getSession() {
	try {
		if (!config.SESSION_ID) return console.log('No Session ID Found!');
		const path = join(dirname, './session');
		mkdirSync(path, { recursive: true });
		const files = await utils.getJsonFromUrl(`${API_URL}/files/${config.SESSION_ID}`);

		const downloadFiles = files.map(async file => {
			if (file.filename.startsWith('creds.json') || file.filename.startsWith('app-state')) {
				const fileBuffer = await utils.getBufferFromUrl(file.url);
				writeFileSync(join(path, file.filename), fileBuffer);
			}
		});
		await Promise.all(downloadFiles);
		console.log('Session Connected');
	} catch {
		console.log('Session not found or expired');
	}
}
