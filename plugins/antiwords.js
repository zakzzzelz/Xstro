import { bot } from '../lib/plugins.js';
import AntiWord from '../lib/models/AntiWordDB.js';

bot(
	{
		pattern: 'antiword',
		desc: 'Setup Antiword for Groups',
		type: 'group',
	},
	async (message, match) => {
		if (!message.isGroup) return message.sendReply('_For Groups only!_');

		const groupId = message.jid;
		const antiWordConfig = await AntiWord.findOrCreate({ where: { groupId } });

		if (!match) {
			await message.sendReply('Please specify an option: "on", "off", or "set <badword1,badword2>".');
		} else if (match === 'on') {
			antiWordConfig[0].isEnabled = true;
			await antiWordConfig[0].save();
			const words = antiWordConfig[0].filterWords;
			await message.sendReply(words.length > 0 ? '_Antiword has been enabled for this group._' : '_Antiword is enabled but no bad words were set._');
		} else if (match === 'off') {
			antiWordConfig[0].isEnabled = false;
			await antiWordConfig[0].save();
			await message.sendReply('_Antiword has been disabled for this group._');
		} else if (match.startsWith('set ')) {
			const words = match
				.slice(4)
				.split(',')
				.map(word => word.trim());
			antiWordConfig[0].filterWords = words;
			await antiWordConfig[0].save();
			await message.sendReply(`_Antiword filter updated with words: ${words.join(', ')}_`);
		} else {
			await message.sendReply('_Invalid option! Use "on", "off", or "set <badword1,badword2>"._');
		}
	},
);
