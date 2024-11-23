import { bot } from '../lib/handler.js';
import { getBuffer, getJson } from '../lib/utils.js';

bot(
	{
		pattern: 'lyrics',
		isPublic: true,
		desc: 'Search Lyrics',
		type: 'search',
	},
	async (message, match) => {
		const req = match || message.quoted?.text;
		if (!req) return message.sendReply('_Give me song Name_');
		const res = await getJson(`https://itzpire.com/search/lyrics?query=${req}`);
		const { title, album, thumb, lyrics } = res.data;
		const image = await getBuffer(thumb);
		return await message.send(image, { caption: `*${title}*\n\`\`\`${album}\n\n${lyrics}\`\`\`` });
	},
);
