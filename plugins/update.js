import { bot } from '../lib/handler.js';
import { exec } from 'child_process';
import simplegit from 'simple-git';
import { manageProcess } from '../lib/utils.js';
import { updateHerokuApp } from './client/heroku.js';

const git = simplegit();
bot(
	{
		pattern: 'update',
		isPublic: false,
		desc: 'Update the bot',
		type: 'system',
	},
	async (message, match) => {
		await git.fetch();
		const commits = await git.log(['master..origin/master']);
		if (commits.total === 0) return await message.sendReply('```YOU ARE ON THE LATEST VERSION```');
		if (match === 'now') {
			await message.sendReply('_Updating && Upgrading_');
			exec('git stash && git pull origin master', async (err, stderr) => {
				if (err) return await message.sendReply('```' + stderr + '```');
				await message.sendReply('_Rebooting Bot_');
				await manageProcess('restart');
				message.sendReply('_Restart Complete_');
			});
		} else {
			let changes = '_New update available!_\n\n' + '*Patches:* ```' + commits.total + '```\n' + '*Changes:*\n' + commits.all.map((c, i) => '```' + (i + 1) + '. ' + c.message + '```').join('\n') + '\n*To update, send* ```' + message.prefix + 'update now```';
			await message.sendReply(changes);
		}
	},
);

bot(
	{
		pattern: 'redeploy',
		isPublic: false,
		desc: 'Fully Updates & Redeploy Heroku App',
		type: 'system'
	},
	async (message) => {
		if (!process.env.HEROKU_APP_NAME && !process.env.HEROKU_API_KEY) return message.sendReply('```HEROKU API KEY OR APP NAME NOT FOUND | INVAILD REQUEST```')
		await updateHerokuApp()
	}
)