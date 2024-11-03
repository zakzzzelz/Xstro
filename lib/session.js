import axios from 'axios';
import fs from 'fs';
import unzipper from 'unzipper';
import path from 'path';
import { AUTH_SERVER, SESSION_ID } from '../config';

const sessionDir = path.join(__dirname, '..', 'session');
export async function createSession() {
	const zipFilePath = (sessionDir, `${SESSION_ID}.zip`);
	fs.mkdirSync(sessionDir, { recursive: true });

	const response = await axios.get(AUTH_SERVER + `/download/${SESSION_ID}`, { responseType: 'stream' });
	const writer = fs.createWriteStream(zipFilePath);

	response.data.pipe(writer);
	await new Promise((resolve, reject) => {
		writer.on('finish', resolve);
		writer.on('error', reject);
	});

	await fs
		.createReadStream(zipFilePath)
		.pipe(unzipper.Extract({ path: sessionDir }))
		.promise();
	fs.unlinkSync(zipFilePath);
	console.log(`session success`);
}
