import { bot } from '#lib';
import { upload, XSTRO } from '#utils';

bot(
	{
		pattern: 'sticker',
		public: true,
		desc: 'Converts Images and Videos to Sticker',
	},
	async message => {
		let media;
		if (
			!message.reply_message ||
			(!message.reply_message.image && !message.reply_message.video)
		)
			return message.send('_Reply with an Image or Video_');
		media = await message.download();
		let url = await upload(media);
		const sticker = await XSTRO.makeSticker(url.rawUrl);
		return await message.send(sticker, { type: 'sticker' });
	},
);

bot(
	{
		pattern: 'take',
		public: true,
		desc: 'rebrands a sticker to bot',
	},
	async message => {
		let media;
		if (!message.reply_message.sticker)
			return message.send('_Reply a sticker only!_');
		media = await message.download();
		let url = await upload(media);
		const sticker = await XSTRO.makeSticker(url.rawUrl);
		return await message.send(sticker, { type: 'sticker' });
	},
);
