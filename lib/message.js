import { handleCommand } from './handler.js';
import { serialize } from './serialize.js';
import { saveMessageAndContact } from './client/messages.js';
import { commands } from './client/plugins.js';

export const handleMessage = async (rawMessage, conn, patternCache, AUTO_READ, AUTO_STATUS_READ) => {
	if (rawMessage?.message?.ephemeralMessage) {
		const {
			message: {
				ephemeralMessage: { message },
			},
		} = rawMessage;
		const contentType = Object.keys(message)[0];
		rawMessage.message = { [contentType]: { ...message[contentType], contextInfo: { ...message[contentType].contextInfo } } };
	}

	const msg = await serialize(JSON.parse(JSON.stringify(rawMessage)), conn);
	if (!msg?.body) return;

	await saveMessageAndContact(msg);
	if (AUTO_READ) await conn.readMessages([msg.key]);
	if (AUTO_STATUS_READ && msg.from === 'status@broadcast') await conn.readMessages([msg.key]);

	for (const cmd of commands) {
		if (!msg.body || !cmd.pattern) continue;
		const cachedCmd = patternCache.get(cmd.pattern.toString());
		if (cachedCmd && msg.body.match(cachedCmd.pattern)) {
			const match = msg.body.match(cachedCmd.pattern);
			await handleCommand(cachedCmd, { ...msg, prefix: match[1], command: `${match[1]}${match[2]}` }, conn);
			continue;
		}
		if (cmd.on) await handleCommand(cmd, msg, conn);
	}
};
