import { bot } from '../lib/client/plugins.js';

bot(
	{
		pattern: 'dlt',
		isPublic: false,
		desc: 'Deletes Message',
		type: 'whatsapp',
	},
	async instance => {
		if (!instance.quoted) return instance.sendReply('_Reply A Message_');
		const msg = instance?.quoted;
		return await instance.delete(msg);
	},
);
