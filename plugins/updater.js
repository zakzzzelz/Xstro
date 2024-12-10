import { bot } from '../lib/plugins.js';
import { isLatest, updateBot, upgradeBot } from '../lib/updater.js';

bot(
	{
		pattern: 'update',
		isPublic: false,
		desc: 'Updates Bot',
	},
	async (message, match) => {
		const updated = await isLatest();
		if (updated) return message.send('```You are on the Latest Update```');
		if (match.toString().toLowerCase() === 'now') {
			await message.send('```Updating Bot```');
			await updateBot();
			await message.send('```Bot Updated```');
		} else {
			return message.send('```Invaild, use ' + message.prefix + 'update now```');
		}
	},
);

bot(
	{
		pattern: 'upgrade',
		isPublic: false,
		desc: 'Upgrades Bot',
	},
	async message => {
		await message.send('```Upgrading Bot Files```');
		await upgradeBot();
		return message.send('```Upgrade Success```');
	},
);
