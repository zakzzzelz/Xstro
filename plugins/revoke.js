import { bot } from '../lib/client/plugins.js';

bot(
	{
		pattern: 'revoke',
		isPublic: true,
		desc: 'Revoke Invite link',
		type: 'group',
	},
	async (message, match, m, client) => {
		if (!m.isGroup) return message.sendReply('_For groups only!_');
		if (!m.isAdmin && !m.isBotAdmin) return message.sendReply('_For Admins Only!_');
		await client.groupRevokeInvite(message.jid);
		return message.sendReply('_Group Link Revoked!_');
	},
);
