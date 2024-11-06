import { BOT_INFO, GITHUB_URL } from '../config.js';
import { bot } from '../lib/plugins.js';
import { getBuffer, runtime } from '../lib/core/utils.js';

bot(
	{
		pattern: 'runtime',
		alias: 'uptime',
		desc: 'Get Runtime of bot',
		type: 'system',
	},
	async message => {
		return await message.sendReply(`_ʙᴏᴛ ʀᴜɴɴɪɴɢ ${runtime(process.uptime())}_`);
	},
);
