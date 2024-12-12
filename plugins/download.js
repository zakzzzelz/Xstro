import { extractUrlFromString, getBuffer } from 'utils';
import { bot } from '../lib/cmds.js';
import { facebook, instagram, tiktok, twitter } from '../utils/scrapers.js';

bot(
	{
		pattern: 'facebook',
		isPublic: true,
		desc: 'Downloads Facebook Videos',
	},
	async (message, match) => {
		const url = extractUrlFromString(match || message.reply_message?.text);
		if (!url) return message.send('_Invaild Url_');
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
		const url = extractUrlFromString(match || message.reply_message?.text);
		if (!url) return message.send('_Invaild Url_');
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
		const url = extractUrlFromString(match || message.reply_message?.text);
		if (!url) return message.send('_Invaild Url_');
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
		const url = extractUrlFromString(match || message.reply_message?.text);
		if (!url) return message.send('_Invaild Url_');
		const res = await tiktok(url);
		const video = await getBuffer(res.video.noWatermark);
		return await message.send(video, { caption: res.title });
	},
);
