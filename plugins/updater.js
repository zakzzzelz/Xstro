import { bot } from '../lib/cmds.js';
import { isLatest, updateBot, updateHerokuApp, upgradeBot } from '../utils/updater.js';

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

bot(
	{
		pattern: 'redeploy',
		isPublic: false,
		desc: 'Fully Updates & Redeploy Heroku App',
		type: 'system',
	},
	async message => {
		if (!process.env.HEROKU_APP_NAME && !process.env.HEROKU_API_KEY) return message.send('invaild heroku app, make sure you are running on heroku with the correct variables');
		message.send('Redeploying Heroku Dyno\n5mins');
		await updateHerokuApp();
	},
);
