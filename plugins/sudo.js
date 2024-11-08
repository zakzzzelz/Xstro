import { bot } from '../lib/client/plugins.js';
import { getSudo, delSudo, addSudo } from '../lib/db/sudo.js';
import { numtoId } from '../lib/utils/utils.js';

bot(
	{
		pattern: 'setsudo',
		alias: 'addsudo',
		desc: 'Add User to Sudo list',
		type: 'user',
	},
	async (message, match) => {
		const User = match || message.quoted?.sender || message.mention[0];
		const sudolist = await addSudo(User);
		return message.sendReply(sudolist);
	},
);

bot(
	{
		pattern: 'delsudo',
		alias: 'removesudo',
		desc: 'Remove User from Sudo',
		type: 'user',
	},
	async (message, match) => {
		if (match) return numtoId(match);
		const User = match || message.quoted?.sender || message.mention[0];
		const rsudo = await delSudo(User);
		return message.sendReply(rsudo);
	},
);

bot(
	{
		pattern: 'getsudo',
		alias: 'listsudo',
		type: 'user',
	},
	async m => {
		let s = await getSudo();
		if (s === '_No Sudo Numbers_') return m.sendReply('\n_No Sudo Numbers_');
		let list =
			'*_Sudo Users_*\n\n' +
			s
				.split('\n')
				.map((u, i) => `${i + 1}. @${u.replace('@s.whatsapp.net', '').trim()}`)
				.join('\n');
		return m.sendReply(list, {
			mentions: s.split('\n').map(u => `${u.replace('@s.whatsapp.net', '').trim()}@s.whatsapp.net`),
		});
	},
);
