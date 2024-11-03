import { BOT_INFO, GITHUB_URL } from '../config.js';
import { bot } from '../lib/plugins.js';
import { getBuffer, runtime } from '../lib/utils.js';

bot(
	{
		pattern: 'runtime',
		alias: 'uptime',
		desc: 'Get Runtime of bot',
		type: 'system',
	},
	async message => {
		return await message.sendReply(`_ʙᴏᴛ ʀᴜɴɴɪɴɢ ${runtime(process.uptime())}_`, {
			contextInfo: {
				externalAdReply: {
					title: BOT_INFO.split(';')[0],
					body: BOT_INFO.split(';')[1],
					thumbnail: await getBuffer(BOT_INFO.split(';')[2]),
					mediaType: 2,
					showAdAttribution: true,
					sourceUrl: GITHUB_URL,
				},
			},
		});
	},
);
