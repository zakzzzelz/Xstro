import { bot } from '../lib/plugins.js';
import { setAnti } from './sql/antidel.js';
import { disableAntiVV, enableAntiVV, getStatus } from './sql/antivv.js';

bot(
	{
		pattern: 'antidel',
		isPublic: false,
		desc: 'Configure AntiDelete',
		type: 'misc',
	},
	async (message, match, { prefix, pushName }) => {
		if (!message.isGroup) return message.sendReply('_For groups only!_');
		if (!match) return message.sendReply(`_${pushName} Wrong Usage!_\n${prefix}antidel on | off`);

		const chatId = message.jid;
		const status = match.toLowerCase() === 'on';

		const setStatus = await setAnti(chatId, status);
		if (setStatus) {
			return message.sendReply(`_Anti-delete has been turned ${status ? 'on' : 'off'}._`);
		} else {
			return message.sendReply('_Failed to update anti-delete status. Please try again._');
		}
	},
);

bot(
	{
		pattern: 'antivv',
		isPublic: false,
		desc: 'Configure AntiViewonce',
		type: 'misc',
	},
	async (message, match) => {
		const args = match?.trim()?.toLowerCase();
		if (!args) {
			const status = await getStatus();
			if (!status) return await message.sendReply('_Anti-ViewOnce is currently disabled._');
			return await message.sendReply(`_Anti-ViewOnce is enabled for: ${status === 'all' ? 'all chats' : status === 'dm' ? 'direct messages' : 'group chats'}._`);
		}
		if (['all', 'dm', 'gc'].includes(args)) {
			await enableAntiVV(args);
			return await message.sendReply(`_Anti-ViewOnce enabled for ${args === 'all' ? 'all chats' : args === 'dm' ? 'direct messages' : 'group chats'}._`);
		}
		if (args === 'disable') {
			await disableAntiVV();
			return await message.sendReply('_Anti-ViewOnce has been disabled._');
		}
		return await message.sendReply('_Use:\n- `antivv all` to enable for all chats\n- `antivv dm` to enable for direct messages\n- `antivv gc` to enable for group chats\n- `antivv disable` to disable Anti-ViewOnce._');
	},
);
