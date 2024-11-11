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
		if (!instance.isGroup) return instance.sendReply('_For groups only!_');
		if (!m.isAdmin && !m.isBotAdmin) return instance.sendReply('_For Admins Only!_');
		let jid;
		if (message.quoted) {
			jid = message.quoted.sender;
		} else if (message.mention && message.mention[0]) {
			jid = message.mention[0];
		} else if (match) {
			jid = numtoId(match);
		}
		await client.groupParticipantsUpdate(message.jid, [jid], 'promote');
		return await message.sendReply(`@${jid.replace('@s.whatsapp.net', '')} is now an admin`, { mentions: [jid] });
	},
);
