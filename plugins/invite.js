import { bot } from '../lib/client/plugins.js';

bot(
	{
		pattern: 'invite',
		isPublic: true,
		desc: 'Get Group Invite link',
		type: 'group',
	},
	async (message, match, m, client) => {
		if (!m.isGroup) return message.sendReply('_For groups only!_');
		if (!m.isAdmin && !m.isBotAdmin) return message.sendReply('_For Admins Only!_');
		const code = client.groupInviteCode(message.jid);
		return message.sendReply(`*_Invite Link: https://chat.whatsapp.com/${code}_*`);
	},
);
