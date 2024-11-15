import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { moveFiles, extractZipFile, endProcess } from './utils.js';
import config from '../config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const authDir = path.join(__dirname, '..', 'session');
const systemp = path.join(__dirname, 'temp');

export const createSession = async () => {
	if (!config.SESSION_ID) return console.error('No Session Found!');
	const url = `https://server-nhv1.onrender.com/download/${config.SESSION_ID}`;
	const dir = path.join(systemp, `${config.SESSION_ID}.zip`);
	const pathFile = path.join(systemp, config.SESSION_ID);

	if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });
	if (!fs.existsSync(systemp)) fs.mkdirSync(systemp, { recursive: true });

	try {
		const response = await axios({
			method: 'get',
			url: url,
			responseType: 'stream',
		});

		await new Promise((resolve, reject) => {
			const writer = fs.createWriteStream(dir);
			response.data.pipe(writer);
			writer.on('finish', resolve);
			writer.on('error', reject);
		});

		await extractZipFile(dir, pathFile);
		await new Promise(resolve => setTimeout(resolve, 1000));
		await moveFiles(pathFile, authDir);
		fs.rmSync(systemp, { recursive: true, force: true });
		console.log('Session created');
	} catch (error) {
		if (fs.existsSync(systemp)) {
			fs.rmSync(systemp, { recursive: true, force: true });
		}
		console.log('Session failed');
		await endProcess();
	}
};
