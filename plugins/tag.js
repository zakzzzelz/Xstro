import { bot } from '../lib/client/plugins.js';

bot(
	{
		pattern: 'tag ?(.*)',
		isPublic: true,
		desc: 'Tag all participants in the group with an optional message',
		type: 'group',
	},
	async (message, match, m, client) => {
		if (!m.isGroup) return message.sendReply('_For groups only!_');
		if (!m.isAdmin && !m.isBotAdmin) return message.sendReply('_For Admins Only!_');
		const msg = match || message.quoted?.text;
		const text = msg || '';

		const participants = await client.groupMetadata(message.jid);
		const participantJids = participants.participants.map(p => p.id);

		let taggedMessage = text ? `*${text}*` : '';

		await client.sendMessage(message.jid, {
			text: taggedMessage,
			mentions: participantJids,
		});
	},
);
