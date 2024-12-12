import { extractUrlFromString, getBuffer } from 'utils';
import { bot } from '../lib/cmds.js';
import { facebook, instagram } from '../utils/scrapers.js';

bot(
	{
		pattern: 'facebook',
		isPublic: true,
		desc: 'Downloads Facebook Videos',
	},
	async (message, match) => {
		const url = extractUrlFromString(match || message.reply_message?.text);
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
		const res = await instagram(url);
		const video = await getBuffer(res.download_url);
		return await message.send(video);
	},
);
