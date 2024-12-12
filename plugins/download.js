import { extractUrlFromString, getBuffer } from 'utils';
import { bot } from '../lib/cmds.js';
import { facebook } from '../utils/scrapers.js';

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
