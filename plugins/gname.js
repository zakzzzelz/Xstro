import { bot } from '../lib/client/plugins.js';

bot(
	{
		pattern: 'gname',
		isPublic: true,
		desc: 'Change Group Name',
		type: 'group',
	},
	async (message, match, m, client) => {
		if (!message.isGroup) return message.sendReply('_For groups only!_');
		if (!m.isAdmin && !m.isBotAdmin) return message.sendReply('_For Admins Only!_');
		const subject = match || message.quoted?.text;
		await client.groupUpdateSubject(message.jid, subject);
		return message.sendReply('_Group Name Updated_');
	},
);
