import { bot } from '../lib/client/plugins.js';
import { addBan, getBanned, removeBan } from '../lib/sql/ban.js';
import { numtoId } from '../lib/utils.js';

bot(
	{
		pattern: 'ban ?(.*)',
		desc: 'Ban a user from the bot',
		type: 'user',
	},
	async (message, match) => {
		let jid;
		if (message.quoted) {
			jid = message.quoted.sender;
		} else if (message.mention && message.mention[0]) {
			jid = message.mention[0];
		} else if (match) {
			jid = numtoId(match);
		}
		if (!jid) return message.sendReply('Please mention, quote, or provide the number of a user to ban.');
		const fullJid = jid.includes('@s.whatsapp.net') ? jid : `${jid}@s.whatsapp.net`;
		const trimmedJid = fullJid.replace('@s.whatsapp.net', '');
		return message.sendReply(await addBan(trimmedJid), { mentions: [fullJid] });
	},
);

bot(
	{
		pattern: 'unban ?(.*)',
		desc: 'Unban a user from the bot',
		type: 'user',
	},
	async (message, match) => {
		let jid;
		if (message.quoted) {
			jid = message.quoted.sender;
		} else if (message.mention && message.mention[0]) {
			jid = message.mention[0];
		} else if (match) {
			jid = numtoId(match);
		}
		if (!jid) return message.sendReply('Please mention, quote, or provide the number of a user to unban.');
		const fullJid = jid.includes('@s.whatsapp.net') ? jid : `${jid}@s.whatsapp.net`;
		const trimmedJid = fullJid.replace('@s.whatsapp.net', '');
		return message.sendReply(await removeBan(trimmedJid), { mentions: [fullJid] });
	},
);

bot(
	{
		pattern: 'getban',
		desc: 'Get a list of all banned users',
		type: 'user',
	},
	async message => {
		const bannedUsers = await getBanned();
		if (bannedUsers.length === 0) return message.sendReply('There are no banned users.');
		const mentions = bannedUsers.map(jid => `${jid}@s.whatsapp.net`);
		return message.sendReply('Banned Users:\n' + bannedUsers.map((jid, index) => `${index + 1}. @${jid}`).join('\n'), { mentions });
	},
);
