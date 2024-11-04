import { STICKER_PACK } from '../config.js';
import { bot } from '../lib/plugins.js';

bot(
	{
		pattern: 'sticker',
		desc: 'Creates Sticker From Image/Video',
		type: 'converter',
	},
	async message => {
		if (!message.reply_message.image && !message.reply_message.video) return message.sendReply('_Reply Image/Video_');
		const sticker = await message.download();
		return await message.send(sticker, { type: 'sticker', packname: STICKER_PACK.split(';')[0], author: STICKER_PACK.split(';')[1] });
	},
);
