import { extractUrlFromString, getBuffer } from 'utils';
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

bot(
	{
		pattern: 'gdrive',
		isPublic: true,
		desc: 'Downloads Google Drive Documents',
	},
	async (message, match) => {
		const url = extractUrlFromString(match || message.reply_message?.text);
		if (!url) return message.send('_Invaild Url_');
		const res = await gdrivedl(url);
		const doc = await getBuffer(res.link);
		return await message.send(doc);
	},
);

bot(
	{
		pattern: 'play',
		isPublic: true,
		desc: 'Searches and download yt audio',
	},
	async (message, match, { prefix }) => {
		if (!match) return message.send(`${prefix}play hello by adele`);
		const res = await play(match);
		console.log(res)
		const { songName, Image, music_url } = res;
		const img = await getBuffer(Image);
		const mp3 = await getBuffer(music_url);

		return await message.send(mp3, {
			type: 'audio',
			contextInfo: {
				externalAdReply: {
					title: songName,
					body: config.BOT_INFO.split(';')[1],
					mediaType: 1,
					thumbnailUrl: img,
					renderLargerThumbnail: true,
					sourceUrl: music_url,
				},
			},
		});
	},
);
