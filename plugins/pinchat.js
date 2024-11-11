import { bot } from '../lib/client/plugins.js';

bot(
	{
		pattern: 'pin',
		isPublic: false,
		desc: 'pin a chat',
		type: 'whatsapp',
	},
	async (message, match, m, client) => {
		await client.chatModify({ pin: true }, message.jid);
		return message.sendReply('_Pined.._');
	},
);

bot(
	{
		pattern: 'unpin ?(.*)',
		isPublic: false,
		desc: 'unpin a msg',
		type: 'whatsapp',
	},
	async (message, match, m, client) => {
		await client.chatModify({ pin: false }, message.jid);
		return message.sendReply('_Unpined.._');
	},
);
