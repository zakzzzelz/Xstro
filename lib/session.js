import { mkdirSync, writeFileSync } from 'node:fs';
import { createDecipheriv } from 'node:crypto';
import { join } from 'node:path';
import { getJson } from 'xstro-utils';

export async function initSession(session) {
	if(!session) return console.log('No session provided');
	session = await getJson(`https://xstrosession-yc43.onrender.com/uploads/${session}/session.json`);
	const res = 'session';
	const algorithm = 'aes-256-cbc';
	const key = Buffer.from(session.key, 'hex');
	const iv = Buffer.from(session.iv, 'hex');
	const decipher = createDecipheriv(algorithm, key, iv);
	let decrypted = decipher.update(session.data, 'hex', 'utf8');
	decrypted += decipher.final('utf8');
	const data = JSON.parse(decrypted);
	mkdirSync(res, { recursive: true });
	writeFileSync(join(res, 'creds.json'), JSON.stringify(data.creds, null, 2));
	writeFileSync(join(res, `app-state-sync-key-${data.creds.myAppStateKeyId}.json`), JSON.stringify(data.syncKey, null, 2));
	return data;
}
