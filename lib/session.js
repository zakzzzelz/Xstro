import fs from 'fs';
import axios from 'axios';
import unzipper from 'unzipper';
import config from '../config.js';

export async function createSession() {
	if (!config.SESSION_ID) return console.log('No session id found');

	try {
		const { status, data } = await axios.get(`https://server-oale.onrender.com/download/${config.SESSION_ID}`, { responseType: 'stream' });
		if (status !== 200) return;

		fs.mkdirSync('../session', { recursive: true });

		await new Promise((resolve, reject) => {
			data
				.pipe(unzipper.Extract({ path: '../session' }))
				.on('finish', resolve)
				.on('error', reject);
			data.on('error', reject);
		});

		console.log('Session Created');
	} catch {
		console.log('Failed to create session');
	}
}
