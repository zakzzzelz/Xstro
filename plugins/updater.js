import { bot } from '#lib';
import { exec } from 'child_process';
import simpleGit from 'simple-git';

const git = simpleGit();

bot(
	{
		pattern: 'update',
		public: false,
		desc: 'Update the bot',
		type: 'system'
	},
	async (message, match) => {
		const prefix = message.prefix;
		await git.fetch();

		const commits = await git.log([`master..origin/master`]);
		if (match === 'now') {
			if (commits.total === 0) {
				return await message.send(message.jid, '```No changes in the latest commit```');
			}
			await message.send(message.jid, '*Updating...*');
			exec(`git stash && git pull origin master`, async (err, stdout, stderr) => {
				if (err) {
					return await message.send(message.jid, '```' + stderr + '```');
				}
				await message.send(message.jid, '*Restarting...*');
				const dependency = await updatedDependencies();
				if (dependency) {
					await message.send(message.jid, '*Dependencies changed. Installing new dependencies...*');
					exec(`npm install`, async (err, stdout, stderr) => {
						if (err) {
							return await message.send(message.jid, '```' + stderr + '```');
						}
						process.exit(0); // Exit process for restart
					});
				} else {
					process.exit(0); // Exit process for restart
				}
			});
		} else {
			if (commits.total === 0) {
				return await message.send(message.jid, '```No changes in the latest commit```');
			} else {
				let changes = '_New update available!_\n\n';
				changes += `*Commits:* \`\`\`${commits.total}\`\`\`\n`;
				changes += `*Branch:* \`\`\`master\`\`\`\n`;
				changes += '*Changes:*\n';
				commits.all.forEach((commit, index) => {
					changes += `\`\`\`${index + 1}. ${commit.message}\`\`\`\n`;
				});
				changes += `\n*To update, use* \`\`\`${prefix}update now\`\`\``;
				await message.send(message.jid, changes);
			}
		}
	}
);

const updatedDependencies = async () => {
	try {
		const diff = await git.diff([`master..origin/master`]);
		return diff.includes('"dependencies":');
	} catch (error) {
		console.error('Error occurred while checking package.json:', error);
		return false;
	}
};
