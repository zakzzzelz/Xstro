import { extractUrlFromString, getBuffer } from 'xstro-utils';
import { bot } from '#lib/cmds';
import { fancy } from '#utils/fancy';
import { facebook, gdrivedl, instagram, tiktok, twitter, youtube } from '#utils/scrapers';

bot(
	{
		pattern: 'facebook',
		isPublic: true,
		desc: 'Downloads Facebook Videos',
	},
	async (message, match) => {
		const input = match || message.reply_message?.text;
		if (!input) return message.send('_Invalid URL_');
		const url = extractUrlFromString(input);
		if (!url) return message.send('_Invalid URL_');
		const res = await facebook(url);
		const video = await getBuffer(res.hd_video);
		return await message.send(video);
	},
);

bot(
	{
		pattern: 'instagram',
		isPublic: true,
		desc: 'Downloads Instagram Videos',
	},
	async (message, match) => {
		const input = match || message.reply_message?.text;
		if (!input) return message.send('_Invalid URL_');
		const url = extractUrlFromString(input);
		if (!url) return message.send('_Invalid URL_');
		const res = await instagram(url);
		const video = await getBuffer(res.download_url);
		return await message.send(video);
	},
);

bot(
	{
		pattern: 'twitter',
		isPublic: true,
		desc: 'Downloads X Videos',
	},
	async (message, match) => {
		const input = match || message.reply_message?.text;
		if (!input) return message.send('_Invalid URL_');
		const url = extractUrlFromString(input);
		if (!url) return message.send('_Invalid URL_');
		const res = await twitter(url);
		const video = await getBuffer(res.downloads.url);
		return await message.send(video);
	},
);

bot(
	{
		pattern: 'tiktok',
		isPublic: true,
		desc: 'Downloads Tiktok Videos',
	},
	async (message, match) => {
		const input = match || message.reply_message?.text;
		if (!input) return message.send('_Invalid URL_');
		const url = extractUrlFromString(input);
		if (!url) return message.send('_Invalid URL_');
		const res = await tiktok(url);
		const video = await getBuffer(res.video.noWatermark);
		return await message.send(video, { caption: res.title });
	},
);

bot(
	{
		pattern: 'gdrive',
		isPublic: true,
		desc: 'Downloads Google Drive Documents',
	},
	async (message, match) => {
		const input = match || message.reply_message?.text;
		if (!input) return message.send('_Invalid URL_');
		const url = extractUrlFromString(input);
		if (!url) return message.send('_Invalid URL_');
		const res = await gdrivedl(url);
		const doc = await getBuffer(res.link);
		return await message.send(doc);
	},
);

bot(
	{
		pattern: 'ytv',
		isPublic: true,
		desc: 'Downloads A Youtube Video',
	},
	async (message, match) => {
		const input = match || message.reply_message?.text;
		if (!input) return message.send('_Invalid URL_');
		const url = extractUrlFromString(input);
		if (!url) return message.send('_Invalid URL_');
		const res = await youtube(url, { ytmp4: true });
		const { link, thumbnail, title } = res;
		const video = await getBuffer(link);
		return await message.send(video, { contextInfo: { isForwarded: true, externalAdReply: { title: fancy(`Xstro youtube downloader`), body: title, mediaType: 1, thumbnail: await getBuffer(thumbnail), sourceUrl: 'https://whatsapp.com/channel/0029VazuKvb7z4kbLQvbn50x', renderLargerThumbnail: true } } });
	},
);

bot(
	{
		pattern: 'yta',
		isPublic: true,
		desc: 'Downloads A Youtube Audio',
	},
	async (message, match) => {
		const input = match || message.reply_message?.text;
		if (!input) return message.send('_Invalid URL_');
		const url = extractUrlFromString(input);
		if (!url) return message.send('_Invalid URL_');
		const res = await youtube(url, { ytmp3: true });
		const { link, thumbnail, title } = res;
		const audio = await getBuffer(link);
		return await message.send(audio, { contextInfo: { isForwarded: true, externalAdReply: { title: title, body: title, mediaType: 1, thumbnail: await getBuffer(thumbnail), sourceUrl: 'https://whatsapp.com/channel/0029VazuKvb7z4kbLQvbn50x', renderLargerThumbnail: true } } });
	},
);
