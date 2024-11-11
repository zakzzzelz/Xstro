import { bot } from '../lib/client/plugins.js';

bot(
	{
		pattern: 'tagadmin',
		isPublic: false,
		desc: 'Tags Admins of A Group',
		type: 'group',
	},
	async (message, match, m, client) => {
		if (!m.isGroup) return message.sendReply('_For groups only!_');
		const groupMetadata = await client.groupMetadata(message.jid);
		const groupAdmins = groupMetadata.participants.filter(p => p.admin !== null).map(p => p.id);
		if (groupAdmins.length > 0) {
			const adminTags = groupAdmins.map(admin => `@${admin.split('@')[0]}`);
			const replyText = `Group Admins: ${adminTags.join('\n')}`;
			await message.sendReply(replyText, { mentions: groupAdmins });
		} else {
			await message.sendReply('_No admins found._');
		}
	},
);
