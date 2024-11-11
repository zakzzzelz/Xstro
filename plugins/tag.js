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

bot(
	{
		pattern: 'tagall',
		isPublic: true,
		desc: 'Tag all participants in the group',
		type: 'group',
	},
	async (message, match, m, client) => {
		if (!m.isGroup) return message.sendReply('_For groups only!_');
		const msg = match || message.quoted?.text;
		if (!msg) return message.sendReply('_You Must Provide A Reason for tagging everyone_');
		const participants = await client.groupMetadata(message.jid);
		const participantJids = participants.participants.map(p => p.id);
		await client.sendMessage(message.jid, {
			text: msg,
			mentions: participantJids,
		});
	},
);
