import { bot } from '../lib/plugins.js';
import { isLatest, updateBot } from '../lib/updater.js';

bot(
	{
		pattern: 'update',
		isPublic: false,
		desc: 'Updates Bot',
	},
	async (message, match) => {
		const updated = await isLatest();
		if (updated) return message.send('```You are on the Latest Update```');
		if (!match === 'now') return message.send('```Invaild, use ' + message.prefix + 'update now```');
		const updater = await updateBot();
		if (updater) {
			message.send('```Update Success```');
		} else {
			message.send('```Failed to update bot```');
		}
	},
);
