import { extractUrlFromString, getBuffer } from 'xstro-utils';
import { bot } from '../lib/cmds.js';
import { facebook, gdrivedl, instagram, play, tiktok, twitter } from '../utils/scrapers.js';
import config from '../config.js';

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
		pattern: 'play',
		isPublic: false,
		desc: 'Downloads Music from search query',
	},
	async (message, match) => {
		if (!match) return message.send('_Give me A Search Query!_');
		const msg = await message.send('*downloading*');
		const res = await play(encodeURIComponent(match.trim()));
		const { songName, Image, audio_url } = res;
		await msg.edit(`*${songName}*\n*downloaded*`);
		await msg.react('✅');
		const audio = await getBuffer(audio_url.downloadUrl);
		return await message.send(audio, {
			type: 'audio',
			contextInfo: {
				isForwarded: false,
				externalAdReply: {
					title: songName,
					body: config.CAPTION,
					mediaType: 1,
					thumbnail: await getBuffer(Image),
					sourceUrl: 'https://whatsapp.com/channel/0029VazuKvb7z4kbLQvbn50x',
					renderLargerThumbnail: true,
				},
			},
		});
	},
);
