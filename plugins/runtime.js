import { bot } from '../lib/client/plugins.js';
import { fancy } from './client/font.js';
import { runtime } from '../lib/utils.js';

bot(
	{
		pattern: 'runtime',
		isPublic: true,
		desc: 'Get Runtime of bot',
		type: 'system',
	},
	async message => {
		return await message.sendReply(fancy(`bot running since\n${runtime(process.uptime())}`));
	},
);
