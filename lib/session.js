import { XUtils } from 'utils';
import fs from 'fs';
import path from 'path';
import config from '../config.js';
import { manageProcess } from './utils.js';

const { SESSION_ID } = config;
const SESSION_URL = 'https://xstrosession.onrender.com';
const SESSION_DIR = path.join('./session');

export default async function getSession() {
	if (!SESSION_ID) {
		console.log('I need Session Id to Run');
		await manageProcess();
	}

	try {
		const res = await XUtils.getJson(`${SESSION_URL}/session/${SESSION_ID}`);
		const { files } = res;
		if (!fs.existsSync(SESSION_DIR)) fs.mkdirSync(SESSION_DIR, { recursive: true });

		for (const file of files) {
			const { name, url } = file;
			if (name.startsWith('app-state-sync-key') || name === 'creds.json') {
				try {
					const buffer = await XUtils.getBuffer(url);
					const filePath = path.join(SESSION_DIR, name);
					fs.writeFileSync(filePath, buffer);
				} catch (err) {}
			}
		}
	} catch {
		console.log('Session Expired');
		return await manageProcess();
	}
}
