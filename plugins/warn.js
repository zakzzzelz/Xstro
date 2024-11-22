import { bot } from '../lib/handler.js';

bot(
	{
		pattern: 'warn',
		isPublic: false,
		desc: 'Warns A User',
		type: 'user',
	},
	async (message, match, m, client) => {},
);

bot(
	{
		pattern: 'rwarn',
		isPublic: false,
		desc: 'Warns A User',
		type: 'user',
	},
	async (message, match, m, client) => {},
);

bot(
	{
		pattern: 'getwarns',
		isPublic: false,
		desc: 'Warns A User',
		type: 'user',
	},
	async (message, match, m, client) => {},
);
