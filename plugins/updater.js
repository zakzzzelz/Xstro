import { bot } from '../lib/handler.js';
import { fancy } from './client/font.js'
import { exec } from 'child_process';
import simplegit from 'simple-git';
import { manageProcess } from '../lib/utils.js';
import { updateHerokuApp } from './client/heroku.js';
import config from '../config.js';

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
		if (commits.total === 0) return await message.sendReply(fancy(`you are on version ${config.VERSION}`));
		if (match === 'now') {
			message.sendReply(fancy('restarting bot'))
			exec('git stash && git pull origin master', async (err, stderr) => {
				if (err) return await message.sendReply('```' + stderr + '```');
			});
			exec('git stash && git pull origin master', async (err, stdout, stderr) => {
				if (err) {
					return await message.sendReply('Git error: ```' + stderr + '```');
				}
				if (stdout) {
					console.log('Git output:', stdout);
				}
			});
			exec('yarn', async (err, stdout, stderr) => {
				if (err) return await message.sendReply('Yarn error: ```' + stderr + '```');
				if (stdout) console.log('Yarn output:', stdout);
				await manageProcess('restart');
			});
		} else {
			let patches = `*Patches:* \`\`\`${commits.total}\`\`\``;
			let changesList = commits.all
				.map((c, i) => `\`\`\`${i + 1}. ${c.message}\`\`\``)
				.join('\n');

			let changes = `*New Update*\n\n${patches}\n*Changes:*\n${changesList}\n\n*Use:* \`\`\`${message.prefix}update now\`\`\``;
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
		if (!process.env.HEROKU_APP_NAME && !process.env.HEROKU_API_KEY) return message.sendReply(fancy('invaild heroku app, make sure you are running on heroku with the correct variables'))
		await updateHerokuApp()
	}
)