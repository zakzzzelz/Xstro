import { handleCommand } from './handler.js';
import { commands } from './handler.js';
import config from '../config.js';
import { logMessages } from './logger.js';

export const handleMessage = async (msg, conn, cache, __events) => {
	if (!msg) return;
	if (config.AUTO_READ) await conn.readMessages([msg.key]);
	if (config.AUTO_STATUS_READ && msg.from === 'status@broadcast') await conn.readMessages([msg.key]);

	for (const cmd of commands) {
		if (!msg.body || !cmd.pattern) return;
		const plugin = cache.get(cmd.pattern.toString());
		if (plugin && msg.body.match(plugin.pattern)) {
			const match = msg.body.match(plugin.pattern);
			if (config.CMD_REACT) await conn.sendMessage(msg.from, { react: { text: '🎶', key: msg.key } })
			await handleCommand(plugin, { ...msg, prefix: match[1], command: `${match[1]}${match[2]}` }, conn, __events);
			continue;
		}
		if (cmd.on) await handleCommand(cmd, msg, conn, __events);
	}
	if (config.LOGGER) await logMessages(msg, conn);
};
