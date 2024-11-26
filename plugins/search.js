import config from '../config.js';
import { bot } from '../lib/handler.js';
import { fancy } from './client/font.js'
import { getBuffer, getJson } from '../lib/utils.js';

const base_url = 'https://api.giftedtech.my.id/api/'
const { API_KEY } = config

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

bot(
	{
		pattern: 'stickersearch',
		isPublic: true,
		desc: 'Search and Download Stickers',
		type: 'search'
	},
	async (message, match) => {
		if (!match) return message.sendReply('```Give me a search query```');
		const req = await getJson(`${base_url}search/stickersearch?apikey=${API_KEY}&query=${match}`);
		for (const stickerUrl of req.results.sticker) {
			const buff = await getBuffer(stickerUrl);
			await message.send(buff, { type: 'sticker' });
		}
	}
);

bot(
	{
		pattern: 'google',
		isPublic: true,
		desc: 'Search and Get Google Results',
		type: 'search'
	},
	async (message, match) => {
		if (!match) return message.sendReply('```Give me a search query```')
		const req = await getJson(`https://api.giftedtech.my.id/api/search/google?apikey=gifted&query=${match}`);
		for (const result of req.results) {
			await message.sendReply(
				`*Title:* ${result.title}\n*Description:* ${result.description}\n*URL:* ${result.url}`
			);
		}
	}
);

bot(
	{
		pattern: 'google',
		isPublic: true,
		desc: 'Search and Get Google Results',
		type: 'search'
	},
	async (message, match) => {
		if (!match) return message.sendReply('```Give me a search query```');
		const req = await getJson(`https://api.giftedtech.my.id/api/search/google?apikey=${API_KEY}&query=${match}`);

		if (!req.results || req.results.length === 0) return message.sendReply('```No results found for your query.```');

		let resultsMessage = '';
		req.results.forEach((result, index) => {
			resultsMessage += `\n\n*Title:* ${fancy(result.title)}\n*Description:* ${fancy(result.description)}\n*URL:* ${result.url}\n\n`;
		});

		await message.sendReply(`Google Search\n\n${resultsMessage}`);
	}
);
