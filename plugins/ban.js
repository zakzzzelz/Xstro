import { bot } from '../lib/client/plugins.js';
import { addBan, getBanned, removeBan } from '../lib/sql/ban.js';
import { numtoId } from '../lib/utils.js';

bot(
	{
		pattern: 'ban ?(.*)',
		isPublic: false,
		desc: 'Ban a user from the bot',
		type: 'user',
	},
	async (instance, args) => {
		let jid;
		if (message.quoted) {
			jid = message.quoted.sender;
		} else if (message.mention && message.mention[0]) {
			jid = message.mention[0];
		} else if (match) {
			jid = numtoId(match);
		}
		if (!jid) return message.sendReply('_Tag, Reply, or provide the number of a user to ban._');
		const fullJid = jid.includes('@s.whatsapp.net') ? jid : `${jid}@s.whatsapp.net`;
		const trimmedJid = fullJid.replace('@s.whatsapp.net', '');
		return message.sendReply(await addBan(trimmedJid), { mentions: [fullJid] });
	},
);

bot(
	{
		pattern: 'unban ?(.*)',
		isPublic: false,
		desc: 'Unban a user from the bot',
		type: 'user',
	},
	async (instance, args) => {
		let jid;
		if (message.quoted) {
			jid = message.quoted.sender;
		} else if (message.mention && message.mention[0]) {
			jid = message.mention[0];
		} else if (match) {
			jid = numtoId(match);
		}
		if (!jid) return message.sendReply('_Tag, Reply, or provide the number of a user to unban._');
		const fullJid = jid.includes('@s.whatsapp.net') ? jid : `${jid}@s.whatsapp.net`;
		const trimmedJid = fullJid.replace('@s.whatsapp.net', '');
		return message.sendReply(await removeBan(trimmedJid), { mentions: [fullJid] });
	},
);

bot(
	{
		pattern: 'getban',
		isPublic: false,
		desc: 'Get a list of all banned users',
		type: 'user',
	},
	async message => {
		const bannedUsers = await getBanned();
		if (bannedUsers.length === 0) return message.sendReply('There are no banned users.');
		const mentions = bannedUsers.map(jid => `${jid}@s.whatsapp.net`);
		return message.sendReply('*_Banned Users:_*\n' + bannedUsers.map((jid, index) => `${index + 1}. @${jid}`).join('\n'), { mentions });
	},
);
