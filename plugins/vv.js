import { bot } from '../lib/client/plugins.js';

bot(
	{
		pattern: 'vv',
		isPublic: false,
		desc: 'Download ViewOnce Messages',
		type: 'whatsapp',
	},
	async message => {
		if (!message.quoted.viewonce) return message.sendReply('_Reply A ViewOnce_');
		const media = await message.download();
		return await message.send(media);
	},
);
