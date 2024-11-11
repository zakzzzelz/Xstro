import { bot } from '../lib/client/plugins.js';
import { numtoId } from '../lib/utils.js';

bot(
	{
		pattern: 'demote',
		isPublic: true,
		desc: 'Demotes Someone from Admin',
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
		const adminIds = groupMetadata.participants.filter(participant => participant.isAdmin).map(participant => participant.id);
		if (!adminIds.includes(jid)) {
			return message.sendReply(`_@${jid.replace('@s.whatsapp.net', '')} is not an admin._`, { mentions: [jid] });
		}
		await client.groupParticipantsUpdate(message.jid, [jid], 'demote');
		await message.sendReply(`_@${jid.replace('@s.whatsapp.net', '')} is no longer an admin_`, { mentions: [jid] });
	},
);
