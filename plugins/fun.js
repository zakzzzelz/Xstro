import { bot } from '#lib';
import { XSTRO } from '#utils';

bot(
	{
		pattern: 'facts',
		public: true,
		desc: 'Get random facts',
	},
	async message => {
		return await message.send(`\`\`\`${await XSTRO.facts()}\`\`\``);
	},
);

bot(
	{
		pattern: 'quotes',
		public: true,
		desc: 'Get random quotes',
	},
	async message => {
		return await message.send(`\`\`\`${await XSTRO.quotes()}\`\`\``);
	},
);

bot(
	{
		pattern: 'advice',
		public: true,
		desc: 'Get random advice',
	},
	async message => {
		return await message.send(`\`\`\`${await XSTRO.advice()}\`\`\``);
	},
);

bot(
	{
		pattern: 'rizz',
		public: true,
		desc: 'Get random rizz',
	},
	async message => {
		return await message.send(`\`\`\`${await XSTRO.rizz()}\`\`\``);
	},
);

bot(
	{
		pattern: 'bible',
		public: true,
		desc: 'Get random bible verse',
	},
	async (message, match) => {
		if (!match)
			return await message.send('Please provide a verse:\n.john3:16');
		return await message.send(
			`\`\`\`${await XSTRO.bible(match.trim())}\`\`\``,
		);
	},
);

bot(
	{
		pattern: 'fancy',
		public: true,
		desc: 'Convert text to fancy text',
	},
	async (message, match) => {
		if (!match) return await message.send('Please provide a text');
		return await message.send(await XSTRO.fancy(match));
	},
);
