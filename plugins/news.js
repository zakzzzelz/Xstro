import { bot } from '#lib';
import { XSTRO } from '#utils';

bot(
	{
		pattern: 'news',
		public: true,
		desc: 'Get World News Now',
		type: 'news',
	},
	async message => {
		const res = await XSTRO.news();
		let data = '';
		for (const items of res) {
			data += `\`\`\`Title: ${items.title}\n\nDescription: ${items.description}\n\nlink: ${items.url}\`\`\`\n\n`;
		}
		return await message.send(data);
	},
);

bot(
	{
		pattern: 'footballnews',
		public: true,
		desc: 'Get Latest Football News',
		type: 'news',
	},
	async message => {
		const res = await XSTRO.footballnews();
		let data = '';
		for (const items of res) {
			data += `\`\`\`Title: ${items.title}\nlink: ${items.url}\`\`\`\n\n`;
		}
		return await message.send(data);
	},
);

bot(
	{
		pattern: 'animenews',
		public: true,
		desc: "Get's Latest Anime News",
		type: 'news',
	},
	async message => {
		const res = await XSTRO.animenews();
		let data = '';
		for (const items of res) {
			data += `\`\`\`Title: ${items.title}\nDescription: ${items.description}\nlink: ${items.link}\`\`\`\n\n`;
		}
		return await message.send(data);
	},
);

bot(
	{
		pattern: 'technews',
		public: true,
		desc: 'Get Tech latest news',
		type: 'news',
	},
	async (message, match) => {
		const news = await XSTRO.technews();
		if (!news?.length) return message.send('No news found');
		const formattedNews = news.map((article, index) => `*${index + 1}. ${article.title}*\n${article.description || ''}\n${article.link}`).join('\n\n');
		return message.send(`*Latest Tech News:*\n\n${formattedNews}`);
	},
);
