import { bot } from '#lib';
import { XSTRO } from '#utils';
import { extractUrlFromString } from 'xstro-utils';

bot(
	{
		pattern: 'facebook',
		public: true,
		desc: 'Download Facebook Video',
	},
	async (message, match) => {
		let url = match || message.reply_message?.text;
		if (!url) return message.send('_Provide Facebook link_');
		url = extractUrlFromString(url);
		const media = await XSTRO.facebook(url);
		return await message.send(media);
	},
);

bot(
	{
		pattern: 'instagram',
		public: true,
		desc: 'Download Instagram Video',
	},
	async (message, match) => {
		let url = match || message.reply_message?.text;
		if (!url) return message.send('_Provide Instagram link_');
		url = extractUrlFromString(url);
		const media = await XSTRO.instagram(url);
		return await message.send(media, { type: 'video' });
	},
);

bot(
	{
		pattern: 'twitter',
		public: true,
		desc: 'Download Twitter Video',
	},
	async (message, match) => {
		let url = match || message.reply_message?.text;
		if (!url) return message.send('_Provide Twitter link_');
		url = extractUrlFromString(url);
		const media = await XSTRO.twitter(url);
		return await message.send(media, { type: 'video' });
	},
);

bot(
	{
		pattern: 'yta',
		public: true,
		desc: 'Download Youtube Audio',
	},
	async (message, match) => {
		let url = match || message.reply_message?.text;
		if (!url) return message.send('_Provide Youtube link_');
		url = extractUrlFromString(url);
		const media = await XSTRO.youtube(url, { mp3: true });
		return await message.send(media.url);
	},
);

bot(
	{
		pattern: 'ytv',
		public: true,
		desc: 'Download Youtube Video',
	},
	async (message, match) => {
		let url = match || message.reply_message?.text;
		if (!url) return message.send('_Provide Youtube link_');
		url = extractUrlFromString(url);
		const media = await XSTRO.youtube(url, { mp4: true });
		return await message.send(media.url, {
			type: 'video',
			caption: media.title,
		});
	},
);

bot(
	{
		pattern: 'tiktok',
		public: true,
		desc: 'Download Tiktok Video',
	},
	async (message, match) => {
		let url = match || message.reply_message?.text;
		if (!url) return message.send('_Provide Tiktok link_');
		url = extractUrlFromString(url);
		const media = await XSTRO.tiktok(url);
		return await message.send(media.url, { caption: media.title });
	},
);
