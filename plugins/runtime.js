import { bot } from '../lib/plugins.js';
import { fancy } from '../lib/xstro.js';
import { runtime } from '../lib/utils.js';

bot(
	{
		pattern: 'runtime',
		alias: 'uptime',
		desc: 'Get Runtime of bot',
		type: 'system',
	},
	async message => {
		return await message.sendReply(fancy(`bot running since\n${runtime(process.uptime())}`));
	},
);
