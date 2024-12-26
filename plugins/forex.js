import { bot } from '#lib';
import { XSTRO } from '#utils';

bot(
	{
		pattern: 'fxmajor',
		public: true,
		desc: 'Get Current Market Details for Forex Majors',
		type: 'forex',
	},
	async message => {
		const res = await XSTRO.forex('fxmajor');
		const data = res
			.map(item => {
				return `\`\`\`
Symbol: ${item.Symbol}
Pair: ${item.Pair}
Price: ${item.Price}
Change: ${item.Change} (${item['Change %']})
Bid: ${item.Bid}
Ask: ${item.Ask}
High: ${item.High}
Low: ${item.Low}
Rating: ${item.Rating}
\`\`\``.trim();
			})
			.join('\n\n');
		await message.send(data);
	},
);

bot(
	{
		pattern: 'fxminor',
		public: true,
		desc: 'Get Current Market Details for Forex Minors',
		type: 'forex',
	},
	async message => {
		const res = await XSTRO.forex('fxminor');
		const data = res
			.map(item => {
				return `\`\`\`
Symbol: ${item.Symbol}
Pair: ${item.Pair}
Price: ${item.Price}
Change: ${item.Change} (${item['Change %']})
Bid: ${item.Bid}
Ask: ${item.Ask}
High: ${item.High}
Low: ${item.Low}
Rating: ${item.Rating}
\`\`\``.trim();
			})
			.join('\n\n');
		await message.send(data);
	},
);

bot(
	{
		pattern: 'fxexotic',
		public: true,
		desc: 'Get Current Market Details for Forex Exotic',
		type: 'forex',
	},
	async message => {
		const res = await XSTRO.forex('fxexotic');
		const data = res
			.map(item => {
				return `\`\`\`
Symbol: ${item.Symbol}
Pair: ${item.Pair}
Price: ${item.Price}
Change: ${item.Change} (${item['Change %']})
Bid: ${item.Bid}
Ask: ${item.Ask}
High: ${item.High}
Low: ${item.Low}
Rating: ${item.Rating}
\`\`\``.trim();
			})
			.join('\n\n');
		await message.send(data);
	},
);

bot(
	{
		pattern: 'fxamericas',
		public: true,
		desc: 'Get Current Market Details for Forex Americans',
		type: 'forex',
	},
	async message => {
		const res = await XSTRO.forex('fxamericas');
		const data = res
			.map(item => {
				return `\`\`\`
Symbol: ${item.Symbol}
Pair: ${item.Pair}
Price: ${item.Price}
Change: ${item.Change} (${item['Change %']})
Bid: ${item.Bid}
Ask: ${item.Ask}
High: ${item.High}
Low: ${item.Low}
Rating: ${item.Rating}
\`\`\``.trim();
			})
			.join('\n\n');
		await message.send(data);
	},
);

bot(
	{
		pattern: 'fxeurope',
		public: true,
		desc: 'Get Current Market Details for Forex Europe',
		type: 'forex',
	},
	async message => {
		const res = await XSTRO.forex('fxeurope');
		const data = res
			.map(item => {
				return `\`\`\`
Symbol: ${item.Symbol}
Pair: ${item.Pair}
Price: ${item.Price}
Change: ${item.Change} (${item['Change %']})
Bid: ${item.Bid}
Ask: ${item.Ask}
High: ${item.High}
Low: ${item.Low}
Rating: ${item.Rating}
\`\`\``.trim();
			})
			.join('\n\n');
		await message.send(data);
	},
);

bot(
	{
		pattern: 'fxasia',
		public: true,
		desc: 'Get Current Market Details for Forex Asia',
		type: 'forex',
	},
	async message => {
		const res = await XSTRO.forex('fxmajor');
		const data = res
			.map(item => {
				return `\`\`\`
Symbol: ${item.Symbol}
Pair: ${item.Pair}
Price: ${item.Price}
Change: ${item.Change} (${item['Change %']})
Bid: ${item.Bid}
Ask: ${item.Ask}
High: ${item.High}
Low: ${item.Low}
Rating: ${item.Rating}
\`\`\``.trim();
			})
			.join('\n\n');
		await message.send(data);
	},
);

bot(
	{
		pattern: 'fxpacific',
		public: true,
		desc: 'Get Current Market Details for Forex Pacific',
		type: 'forex',
	},
	async message => {
		const res = await XSTRO.forex('fxmajor');
		const data = res
			.map(item => {
				return `\`\`\`
Symbol: ${item.Symbol}
Pair: ${item.Pair}
Price: ${item.Price}
Change: ${item.Change} (${item['Change %']})
Bid: ${item.Bid}
Ask: ${item.Ask}
High: ${item.High}
Low: ${item.Low}
Rating: ${item.Rating}
\`\`\``.trim();
			})
			.join('\n\n');
		await message.send(data);
	},
);

bot(
	{
		pattern: 'fxeast',
		public: true,
		desc: 'Get Current Market Details for Forex Middle East',
		type: 'forex',
	},
	async message => {
		const res = await XSTRO.forex('fxmiddle-east');
		const data = res
			.map(item => {
				return `\`\`\`
Symbol: ${item.Symbol}
Pair: ${item.Pair}
Price: ${item.Price}
Change: ${item.Change} (${item['Change %']})
Bid: ${item.Bid}
Ask: ${item.Ask}
High: ${item.High}
Low: ${item.Low}
Rating: ${item.Rating}
\`\`\``.trim();
			})
			.join('\n\n');
		await message.send(data);
	},
);

bot(
	{
		pattern: 'fxafrica',
		public: true,
		desc: 'Get Current Market Details for Forex Africa',
		type: 'forex',
	},
	async message => {
		const res = await XSTRO.forex('fxafrica');
		const data = res
			.map(item => {
				return `\`\`\`
Symbol: ${item.Symbol}
Pair: ${item.Pair}
Price: ${item.Price}
Change: ${item.Change} (${item['Change %']})
Bid: ${item.Bid}
Ask: ${item.Ask}
High: ${item.High}
Low: ${item.Low}
Rating: ${item.Rating}
\`\`\``.trim();
			})
			.join('\n\n');
		await message.send(data);
	},
);
