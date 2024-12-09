import { bot } from '../lib/plugins.js';
import { exec } from 'child_process';
import { manageProcess } from '../lib/utils.js';
import { performUpdate, updateHerokuApp } from '../lib/updater.js';

bot(
	{
		pattern: 'update',
		isPublic: false,
		desc: 'Update the bot',
		type: 'system',
	},
	async (message, match) => {
		const updateInfo = await performUpdate();
		if (typeof updateInfo === 'string') {
			message.send('```' + updateInfo + '```');
		} else {
			if (match === 'now') {
				message.send('Restarting bot...');
				exec('git stash && git pull origin master', (pullErr, stderr) => {
					if (pullErr) return message.send('Error pulling updates: ' + stderr);
					manageProcess('restart');
				});
			} else {
				const changes = `*New Update*\n\n*Changes:*\n${updateInfo}\n\n*Use:* ${message.prefix}update now`;
				message.send('```' + changes + '```');
			}
		}
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
