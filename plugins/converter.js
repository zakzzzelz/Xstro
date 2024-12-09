import { getBuffer, getJson } from 'utils';
import { bot } from '../lib/plugins.js';
import { convertToOpus, flipMedia, generatePdf, toBlackVideo, toSticker } from './bot/tools.js';
import config from '../config.js';

bot(
	{
		pattern: 'sticker',
		isPublic: true,
		desc: 'Converts Images/Video to Sticker',
		type: 'converter',
	},
	async message => {
		const media = message.reply_message?.video || message.reply_message?.image;
		if (!media) return message.send('_Reply with an Image or Video!_');
		const msg = await message.download();
		const stickerBuffer = await toSticker(msg);
		await message.send(stickerBuffer, { type: 'sticker' });
	},
);

bot(
	{
		pattern: 'take',
		isPublic: true,
		desc: 'Resends Sticker As Own',
		type: 'converter',
	},
	async message => {
		if (!message.reply_message?.sticker) return message.send('_Reply Sticker_');
		const msg = await message.download();
		const buff = await toSticker(msg);
		return await message.send(buff, { type: 'sticker' });
	},
);

bot(
	{
		pattern: 'rotate',
		isPublic: true,
		desc: 'Rotates Media to a particular direction',
		type: 'converter',
	},
	async (message, match) => {
		if (!message.reply_message?.image && !message.reply_message?.video) return message.send('_Reply to an Image or Video_');
		const options = ['left', 'right', 'vertical', 'horizontal'];
		if (!options.includes(match)) return message.send('_Choose a valid option:_ ' + message.prefix + 'flip left, right, vertical, or horizontal');
		const buff = await message.download();
		const flippedMedia = await flipMedia(buff, match);
		return await message.send(flippedMedia, { caption: '_Flipped successfully_' });
	},
);

bot(
	{
		pattern: 'black',
		isPublic: true,
		desc: 'Converts Audio to Black Video',
		type: 'converter',
	},
	async message => {
		if (!message.reply_message?.audio) return message.send('_Reply An Audio_');
		const buff = await message.download();
		const res = await toBlackVideo(buff);
		return await message.send(res);
	},
);

bot(
	{
		pattern: 'ppt',
		isPublic: true,
		desc: 'Converts Audio to PPT',
		type: 'converter',
	},
	async message => {
		if (!message.reply_message?.audio) return message.send('_Reply An Audio_');
		const media = await message.download();
		const buff = await convertToOpus(media);
		return await message.send(buff);
	},
);

bot(
	{
		pattern: 'emix',
		isPublic: true,
		desc: 'Mix two emojis to be one',
		type: 'converter',
	},
	async (message, match) => {
		const isTwoEmojis = str => /^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F){2}$/u.test(str);
		if (!isTwoEmojis(match)) return message.send('_Give me two emojis_');
		const res = await getJson('https://levanter.onrender.com/emix?q=' + match + '');
		const buff = await getBuffer(res.result);
		const sticker = await toSticker(buff);
		return await message.send(sticker);
	},
);

bot(
	{
		pattern: 'togif',
		isPublic: true,
		desc: 'Converts An Image to Gif',
		type: 'converter',
	},
	async message => {
		if (!message.reply_message?.video) return message.send('_Reply A Video Only!_');
		const video = await message.download();
		return await message.send(video, { caption: '_success!_', gifPlayback: true });
	},
);

bot(
	{
		pattern: 'topdf',
		isPublic: true,
		desc: 'Converts text to Pdf',
		type: 'converter',
	},
	async (message, match) => {
		const text = match || message.reply_message?.text;
		if (!text) return message.send('_Give Me to convert to pdf_');
		const doc = await generatePdf(text.trim());
		return await message.send(doc, { type: 'document', fileName: config.BOT_INFO.split(';')[1] || 'xstro' });
	},
);
