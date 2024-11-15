import { bot } from '../lib/client/plugins.js';

bot(
	{
		pattern: 'archive',
		isPublic: false,
		desc: 'archive whatsapp chat',
		type: 'whatsapp',
	},
	async (message, match, m, client) => {
		const lstMsg = {
			message: m.message,
			key: m.key,
			messageTimestamp: message.timestamp,
		};
		await client.chatModify(
			{
				archive: true,
				lastMessages: [lstMsg],
			},
			message.jid,
		);
		await message.sendReply('_Archived_');
	},
);

bot(
	{
		pattern: 'unarchive',
		isPublic: false,
		desc: 'unarchive whatsapp chat',
		type: 'whatsapp',
	},
	async (message, match, m, client) => {
		const lstMsg = {
			message: m.message,
			key: m.key,
			messageTimestamp: message.timestamp,
		};
		await client.chatModify(
			{
				archive: false,
				lastMessages: [lstMsg],
			},
			message.jid,
		);
		await message.sendReply('_Unarchived_');
	},
);
