import fs from 'fs';
import path from 'path';
import config from '../config.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { getJson, getBuffer } from './utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const API_URL = 'https://session-am5x.onrender.com';

export async function getSession() {
	if (!config.SESSION_ID) return console.error('No Session ID Found!');
	try {
		const sessionDir = path.join(__dirname, '..', 'session');
		fs.mkdirSync(sessionDir, { recursive: true });
		const files = await getJson(`${API_URL}/files/${config.SESSION_ID}`);
		for (const file of files) {
			if (file.filename.startsWith('creds.json') || file.filename.startsWith('app-state')) {
				const fileBuffer = await getBuffer(file.url);
				fs.writeFileSync(path.join(sessionDir, file.filename), fileBuffer);
			}
		}
		console.log('Session Connected');
	} catch (error) {
		throw error.response?.data || error;
	}
}