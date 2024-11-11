import { bot } from '../lib/client/plugins.js';
import { numtoId } from '../lib/utils.js';

bot(
	{
		pattern: 'add ?(.*)',
		isPublic: false,
		desc: 'Adds A User to Group',
		type: 'group',
	},
	async (message, match, m, client) => {
		if (!m.isGroup) return message.sendReply('_For groups only!_');
		if (!m.isAdmin && !m.isBotAdmin) return message.sendReply('_For Admins Only!_');

		let jid;
		if (message.quoted) {
			jid = message.quoted.sender;
		} else if (message.mention && message.mention[0]) {
			jid = message.mention[0];
		} else if (match) {
			jid = numtoId(match);
		}
		if (!jid) return message.sendReply('_Reply, tag, or give me the participant number_');
		try {
			await client.groupParticipantsUpdate(message.jid, [jid], 'add');
			return message.sendReply(`@${jid.split('@')[0]} added`, { mentions: [jid] });
		} catch (error) {
			const inviteLink = await client.groupInviteCode(message.jid);
			const userMessage = {
				text: `_@${message.sender.split('@')[0]} wants to add you to the group._\n\n*_Join here: https://chat.whatsapp.com/${inviteLink}_*\n`,
				mentions: [message.sender],
			};
			await message.sendReply(jid, userMessage);
			return message.sendReply("_Can't Added User, Invite Sent In DM_");
		}
	},
);
