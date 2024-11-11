import { bot } from '../lib/client/plugins.js';

bot(
	{
		pattern: 'dlt',
		isPublic: false,
		desc: 'Deletes Message',
		type: 'whatsapp',
	},
	async message => {
		if (!message.quoted) return message.sendReply('_Reply A Message_');
		const msg = message?.quoted;
		return await message.delete(msg);
	},
);
