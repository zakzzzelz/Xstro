import { bot } from '../lib/client/plugins.js';
import { InstaDL, Tiktok, twitter, YTV } from './client/scrapers.js';
import { extractUrlFromMessage } from '../lib/utils.js';

bot(
	{
		pattern: 'twitter',
		isPublic: true,
		desc: 'downloads x videos',
		type: 'download',
	},
	async (message, match) => {
		const id = match || message.quoted?.text;
		const url = extractUrlFromMessage(id);
		if (!url) return message.sendReply('_Provide X Url_');
		const media = await twitter(url);
		const { buffer, caption } = media;
		return await message.send(buffer, { caption: caption });
	},
);

bot(
	{
		pattern: 'tiktok',
		isPublic: true,
		desc: 'downloads tiktok videos',
		type: 'download',
	},
	async (message, match) => {
		const tiktokUrl = match || message.quoted?.text;
		const url = extractUrlFromMessage(tiktokUrl);
		if (!url || !url.includes('vm.tiktok.com')) return message.sendReply('_Provide Tiktok Url!_');
		const data = await Tiktok(url);
		return await message.send(data.buffer, { caption: data.desc });
	},
);

bot(
	{
		pattern: 'instagram',
		isPublic: true,
		desc: 'downloads instagram videos',
		type: 'download',
	},
	async (message, match) => {
		const insta = match || message.quoted?.text;
		const url = extractUrlFromMessage(insta);
		if (!url) return message.sendReply('_Need Insta Link!_');
		const data = await InstaDL(url);
		return await message.send(data);
	},
);

bot(
	{
		pattern: 'ytv',
		isPublic: true,
		desc: 'downloads youtube videos',
		type: 'download',
	},
	async (message, match) => {
		const yturl = match || message.quoted?.text;
		const url = extractUrlFromMessage(yturl);
		if (!url) return message.sendReply('_I need youtube url_');
		const video = await YTV(url);
		return await message.send(video.buffer, { caption: video.title });
	},
);

