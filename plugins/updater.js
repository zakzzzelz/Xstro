import { bot } from '#lib';
import { isLatest, updateBot, getCommitDetails } from '#utils';

bot(
	{
		pattern: 'update',
		public: false,
		type: 'system',
		desc: 'Updates Bot',
	},
	async (message, match) => {
		if (await isLatest()) return message.send('_Already UptoDate_');
		if (!match) {
			const { commits, behindCount } = await getCommitDetails();
			const formattedCommits = commits.map((commit, index) => `${index + 1}. ${commit}`).join('\n');
			return message.send(`\`\`\`\nCommits: ${behindCount}\nDetails:\n${formattedCommits}\n\`\`\``);
		}
		if (match === 'now') {
			await message.send('```Updating Bot```');
			const updateResult = await updateBot();
			if (updateResult.success) {
				await message.send('```Bot Updated```');
			} else {
				await message.send('```Update Failed```');
			}
		}
	},
);
