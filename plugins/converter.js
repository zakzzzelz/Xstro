import { bot } from '#lib';
import {
	audioToBlackVideo,
	convertToMp3,
	createSticker,
	cropToCircle,
	flipMedia,
	toPTT,
	toVideo,
	upload,
	webpToImage,
	XSTRO
} from '#utils';

bot(
	{
		pattern: 'sticker',
		public: true,
		desc: 'Converts Images and Videos to Sticker',
		type: 'converter'
	},
	async message => {
		let media;
		if (!message.reply_message.image && !message.reply_message.video) {
			return message.send('_Reply with an Image or Video_');
		}
		media = await message.download();
		media = await createSticker(media);
		return message.send(media, { type: 'sticker' });
	}
);

bot(
	{
		pattern: 'take',
		public: true,
		desc: 'rebrands a sticker to bot',
		type: 'converter'
	},
	async message => {
		let media;
		if (!message.reply_message.sticker) return message.send('_Reply a sticker only!_');
		media = await message.download();
		media = await createSticker(media);
		return message.send(media, { type: 'sticker' });
	}
);

bot(
	{
		pattern: 'flip',
		public: true,
		desc: 'Flip media left/right/vertical/horizontal',
		type: 'converter'
	},
	async (message, match, { prefix }) => {
		let media;
		if (!message.reply_message?.image && !message.reply_message?.video)
			return message.send('_Reply to an Image or Video_');
		if (!['left', 'right', 'vertical', 'horizontal'].includes(match)) {
			return message.send(`_Usage: ${prefix}flip <${validDirections.join('/')}>`);
		}
		media = await message.download(true);
		media = await flipMedia(media, match);
		return message.send(media, { caption: `_Flipped to ${match}_` });
	}
);

bot(
	{
		pattern: 'black',
		public: true,
		desc: 'Converts Audio to Black Video',
		type: 'converter'
	},
	async message => {
		let media;
		if (!message.reply_message.audio) return message.send('_Reply Audio_');
		media = await message.download(true);
		media = await audioToBlackVideo(media);
		return await message.send(media);
	}
);

bot(
	{
		pattern: 'ttp',
		public: true,
		desc: 'Designs ttp Stickers',
		type: 'converter'
	},
	async (message, match, { prefix }) => {
		if (!match) return message.send(`_Usage: ${prefix}ttp Astro_`);
		const buff = await XSTRO.ttp(match);
		const { rawUrl } = await upload(buff);
		const sticker = await XSTRO.makeSticker(rawUrl);
		return await message.send(sticker, { type: 'sticker' });
	}
);

bot(
	{
		pattern: 'photo',
		public: true,
		desc: 'Convert Sticker to Photo',
		type: 'converter'
	},
	async message => {
		let media;
		if (!message.reply_message.sticker) return message.send('_Reply Sticker_');
		media = await message.download(true);
		media = await webpToImage(media);
		return message.send(media);
	}
);

bot(
	{
		pattern: 'mp3',
		public: true,
		desc: 'Convert Video to Audio',
		type: 'converter'
	},
	async message => {
		let media;
		if (!message.reply_message.video && !message.reply_message.audio)
			return message.send('_Reply Video or Audio_');
		media = await message.download(true);
		media = await convertToMp3(media);
		return await message.send(media, {
			mimetype: 'audio/mpeg',
			ptt: false
		});
	}
);

bot(
	{
		pattern: 'ptt',
		public: true,
		desc: 'Convert Video to WhatsApp Opus',
		type: 'converter'
	},
	async message => {
		let media;
		if (!message.reply_message.video && !message.reply_message.audio)
			return message.send('_Reply Video or Audio_');
		media = await message.download(true);
		media = await toPTT(media);
		return await message.client.sendMessage(message.jid, {
			audio: media,
			mimetype: 'audio/ogg; codecs=opus',
			ptt: true
		});
	}
);

bot(
	{
		pattern: 'mp4',
		public: true,
		desc: 'Converts Video to playable WhatsApp Video',
		type: 'converter'
	},
	async message => {
		let media;
		if (!message.reply_message.video && !message.reply_message.sticker)
			return message.send('_Reply Video_');
		media = await message.download(true);
		media = await toVideo(media);
		return await message.client.sendMessage(message.jid, {
			video: media,
			mimetype: 'video/mp4'
		});
	}
);

bot(
	{
		pattern: 'crop',
		public: true,
		desc: 'Converts Image or Sticker to Cropped Sticker',
		type: 'converter'
	},
	async message => {
		let media;
		if (!message.reply_message.image && !message.reply_message.sticker)
			return message.send('_Reply Sticker/Image_');
		media = await message.download();
		media = await cropToCircle(media);
		return await message.send(media, { type: 'sticker' });
	}
);
