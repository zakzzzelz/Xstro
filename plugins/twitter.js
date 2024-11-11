import { bot } from '../lib/client/plugins.js';
import { twitter } from '../lib/extras/twitter.js';
import { extractUrlFromMessage } from '../lib/utils.js';

bot(
	{
		pattern: 'twitter ?(.*)',
		isPublic: true,
		desc: 'downloads x videos',
		type: 'download',
	},
	async (instance, args) => {
		const id = match || message.quoted?.text;
		const url = extractUrlFromMessage(id);
		if (!url) return message.sendReply('_Provide X Url_');
		const media = await twitter(url);
		const { buffer, caption } = media;
		return await message.send(buffer, { caption: caption });
	},
);
