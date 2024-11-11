import { bot } from '../lib/client/plugins.js';

bot(
	{
		pattern: 'gdesc ?(.*)',
		isPublic: true,
		desc: 'Changes Group Description',
		type: 'group',
	},
	async (message, match, m, client) => {
		if (!message.isGroup) return message.sendReply('_For groups only!_');
		if (!m.isAdmin && !m.isBotAdmin) return message.sendReply('_For Admins Only!_');
		if (!match) return message.sendReply('_Provide Description to Update Group Desc With!_');
		await client.groupUpdateDescription(message.jid, { desc: match });
		return message.sendReply('_Group Description Updated_');
	},
);
