import { bot } from '../lib/client/plugins.js';

bot(
	{
		pattern: 'clear ?(.*)',
		isPublic: false,
		desc: 'delete whatsapp chat',
		type: 'whatsapp',
	},
	async (message, match) => {
		await message.client.chatModify(
			{
				delete: true,
				lastMessages: [
					{
						key: message.data.key,
						messageTimestamp: message.timestamp,
					},
				],
			},
			message.jid,
		);
		await message.sendReply('_Cleared_');
	},
);
