import { bot } from '../lib/client/plugins.js';
import { numtoId } from '../lib/utils.js';

bot(
	{
		pattern: 'promote',
		isPublic: true,
		desc: 'Promotes Someone to Admin',
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
		const groupMetadata = await client.groupMetadata(message.jid);
		const participant = groupMetadata.participants.find(p => p.id === jid);
		if (participant.admin) return message.sendReply(`@${jid.replace('@s.whatsapp.net', '')} is already an admin.`, { mentions: [jid] });
		await client.groupParticipantsUpdate(message.jid, [jid], 'promote');
		return message.sendReply(`@${jid.replace('@s.whatsapp.net', '')} is now an admin`, { mentions: [jid] });
	},
);
