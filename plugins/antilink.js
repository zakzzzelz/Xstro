import { bot } from '../lib/plugins.js';

bot(
	{
		pattern: 'antilink ?(.*)',
		desc: 'Setup Antilink For Groups',
		type: 'Group',
	},
	async (message, match, m) => {
		if (!message.isGroup) return message.sendReply('_For Groups Only!_');
		if (!m.isAdmin && !m.isBotAdmin) return message.sendReply('_For Admin Only!_');
		const chatId = message.jid;
		/**
		 * Antilink on
		 * Antilink Delete
		 * Antilink Kick
		 * Anitlink Warn functions here
		 */
	},
);
