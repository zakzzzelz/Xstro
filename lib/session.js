import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import unzipper from 'unzipper';
import config from '../config.js';
import { endProcess } from './utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sessionFile = path.resolve(__dirname, '../auth.json');

export async function createSession() {
	if (!config.SESSION_ID) return endProcess();

	try {
		const { status, data } = await axios.get(`https://server-nhv1.onrender.com/download/${config.SESSION_ID}`, { responseType: 'stream' });
		if (status !== 200) return;

		const sessionPath = path.resolve(__dirname, '../session');
		fs.mkdirSync(sessionPath, { recursive: true });

		await new Promise((resolve, reject) => {
			data
				.pipe(unzipper.Extract({ path: sessionPath }))
				.on('finish', resolve)
				.on('error', reject);
			data.on('error', reject);
		});

		const sessionData = { SESSION_ID: config.SESSION_ID, path: sessionPath };
		fs.writeFileSync(sessionFile, JSON.stringify(sessionData, null, 2));
	} catch {
		console.error('Session Failed');
		endProcess();
	}
}

export function loadSession() {
	if (fs.existsSync(sessionFile)) {
		const sessionData = JSON.parse(fs.readFileSync(sessionFile, 'utf-8'));
		return sessionData;
	}
	return null;
}

export function clearSession() {
	if (fs.existsSync(sessionFile)) {
		fs.unlinkSync(sessionFile);
	}
}
