import { handleCommand } from './handler.js';
import { commands } from './handler.js';
import config from '../config.js';
import { logMessages } from './logger.js';

export const handleMessage = async (rawMessage, conn, cache, __events) => {
	await logMessages(rawMessage, conn);
	const msg = rawMessage;
	if (!msg.body) return;
	if (config.AUTO_READ) await conn.readMessages([msg.key]);
	if (config.AUTO_STATUS_READ && msg.from === 'status@broadcast') await conn.readMessages([msg.key]);

	for (const cmd of commands) {
		if (!msg.body || !cmd.pattern) return;
		const plugin = cache.get(cmd.pattern.toString());
		if (plugin && msg.body.match(plugin.pattern)) {
			const match = msg.body.match(plugin.pattern);
			await handleCommand(plugin, { ...msg, prefix: match[1], command: `${match[1]}${match[2]}` }, conn, __events);
			return;
		}
		if (cmd.on) await handleCommand(cmd, msg, conn, __events);
	}
};
