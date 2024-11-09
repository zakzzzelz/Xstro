import { bot } from '../lib/client/plugins.js';
import { fancy } from '../lib/extras/font.js';
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
