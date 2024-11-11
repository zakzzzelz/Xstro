import { bot } from '../lib/client/plugins.js';

bot(
	{
		pattern: 'kick ?(.*)',
		isPublic: false,
		desc: 'Kicks A Participant from Group',
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
		await client.groupParticipantsUpdate(message.jid, [jid], 'remove');
		return message.sendReply(`_@${jid.split('@')[0]} has been kicked!_`, { mentions: [jid] });
	},
);
