import { handleCommand } from './handler.js';
import { commands } from './handler.js';
import config from '../config.js';

export const handleMessage = async (rawMessage, conn, patternCache) => {
	const msg = rawMessage;
	console.log(rawMessage);
	if (!msg.body) return;
	if (config.AUTO_READ) await conn.readMessages([msg.key]);
	if (config.AUTO_STATUS_READ && msg.from === 'status@broadcast') await conn.readMessages([msg.key]);

	for (const cmd of commands) {
		if (!msg.body || !cmd.pattern) return;
		const store = patternCache.get(cmd.pattern.toString());
		if (store && msg.body.match(store.pattern)) {
			const match = msg.body.match(store.pattern);
			await handleCommand(store, { ...msg, prefix: match[1], command: `${match[1]}${match[2]}` }, conn);
			continue;
		}
		if (cmd.on) await handleCommand(cmd, msg, conn);
	}
};
