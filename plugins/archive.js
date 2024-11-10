import { bot } from '../lib/client/plugins.js';

bot(
	{
		pattern: 'archive ?(.*)',
		isPublic: false,
		desc: 'archive whatsapp chat',
		type: 'whatsapp',
	},
	async (message, match) => {
		const lstMsg = {
			message: message.data.message,
			key: message.data.key,
			messageTimestamp: message.timestamp,
		};
		await message.client.chatModify(
			{
				archive: true,
				lastMessages: [lstMsg],
			},
			message.jid,
		);
		await message.sendReply('_Archived.._');
	},
);

bot(
	{
		pattern: 'unarchive ?(.*)',
		isPublic: false,
		desc: 'unarchive whatsapp chat',
		type: 'whatsapp',
	},
	async (message, match) => {
		const lstMsg = {
			message: message.data.message,
			key: message.data.key,
			messageTimestamp: message.timestamp,
		};
		await message.client.chatModify(
			{
				archive: false,
				lastMessages: [lstMsg],
			},
			message.jid,
		);
		await message.sendReply('_Unarchived.._');
	},
);
