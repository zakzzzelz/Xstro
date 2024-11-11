import { bot } from '../lib/client/plugins.js';

bot(
	{
		pattern: 'poll',
		isPublic: true,
		desc: 'Creates a poll in the group.',
		type: 'group',
	},
	async (message, match, m, client) => {
		let [pollName, pollOptions] = match.split(';');

		if (!pollOptions) {
			return await message.sendReply(message.prefix + 'poll question;option1,option2,option3.....');
		}

		let options = [];
		for (let option of pollOptions.split(',')) {
			if (option && option.trim() !== '') {
				options.push(option.trim());
			}
		}

		await client.sendMessage(message.jid, {
			poll: {
				name: pollName,
				values: options,
			},
		});
	},
);
