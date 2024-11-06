import { bot } from '../lib/client/plugins.js';
import { Antilink } from '../lib/db/antilink.js';

bot(
	{
		pattern: 'antilink ?(.*)',
		desc: 'Setup Antilink For Groups',
		type: 'Group',
	},
	async (message, match, m) => {
		if (!message.isGroup || (!m.isAdmin && !m.isBotAdmin)) return message.sendReply(message.isGroup ? '_For Admin Only!_' : '_For Groups Only!_');

		const [settings] = await Antilink.findOrCreate({
			where: { groupId: message.jid },
			defaults: { groupId: message.jid, warnings: {} }, // Initialize warnings here
		});

		const cmd = match.trim().toLowerCase();
		const validActions = ['delete', 'warn', 'kick'];

		if (['on', 'off'].includes(cmd)) {
			const newState = cmd === 'on';
			if (settings.enabled === newState) {
				return message.sendReply(`_Antilink is already ${cmd}_`);
			}
			settings.enabled = newState;
			await settings.save();
			return message.sendReply(`_Antilink ${cmd === 'on' ? 'enabled' : 'disabled'}!_`);
		}

		if (validActions.includes(cmd)) {
			if (!settings.enabled) {
				return message.sendReply('_Please enable antilink first using antilink on_');
			}
			if (settings.action === cmd) {
				return message.sendReply(`_Antilink action is already set to ${cmd}_`);
			}
			settings.action = cmd;
			await settings.save();
			return message.sendReply(`_Antilink action set to ${cmd}_`);
		}

		return message.sendReply('_' + message.prefix + 'antilink on/off/delete/kick/warn_');
	},
);
