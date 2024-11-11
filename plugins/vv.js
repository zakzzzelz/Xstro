import { bot } from '../lib/client/plugins.js';

bot(
	{
		pattern: 'vv',
		isPublic: false,
		desc: 'Download ViewOnce Messages',
		type: 'whatsapp',
	},
	async instance => {
		if (!instance.quoted.viewonce) return instance.sendReply('_Reply A ViewOnce_');
		const media = await instance.download();
		return await instance.send(media);
	},
);
