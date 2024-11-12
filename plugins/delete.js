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
		return await message.delete();
	},
);
