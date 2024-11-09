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
		const jid = numtoId(match) || message.quoted?.sender || message.mention[0];
		if (!jid) return message.sendReply('Please provide a user to ban.');
		return message.sendReply(await addBan(jid), { mentions: [`${jid}@s.whatsapp.net`] });
	},
);

bot(
	{
		pattern: 'unban ?(.*)',
		desc: 'Unban a user from the bot',
		type: 'user',
	},
	async (message, match) => {
		const jid = numtoId(match) || message.quoted?.sender || message.mention[0];
		if (!jid) return message.sendReply('Please provide a user to unban.');
		return message.sendReply(await removeBan(jid), { mentions: [`${jid}@s.whatsapp.net`] });
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
		return message.sendReply('Banned Users:\n' + bannedUsers.map((jid, index) => `${index + 1}. @${jid}`).join('\n'), { mentions: bannedUsers.map(jid => `${jid}@s.whatsapp.net`) });
	},
);
