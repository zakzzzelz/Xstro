import { bot } from '../lib/client/plugins.js';
import { getSudo, delSudo, addSudo } from '../lib/sql/sudo.js';
import { numtoId } from '../lib/utils.js';

bot(
	{
		pattern: 'setsudo',
		isPublic: false,
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
		isPublic: false,
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
		isPublic: false,
		desc: 'Get Sudo Users',
		type: 'user',
	},
	async message => {
		const sudoList = await getSudo();
		if (sudoList === '_No Sudo Numbers_') return message.sendReply('*_No Sudo Users_*');
		const sudoNumbers = sudoList.split('\n').map(number => number.replace('@s.whatsapp.net', '').trim());
		const formattedSudoList = '*Sudo Users*\n\n' + sudoNumbers.map((number, index) => `${index + 1}. @${number}`).join('\n');
		const mentions = sudoNumbers.map(number => `${number}@s.whatsapp.net`);
		return message.sendReply(formattedSudoList, { mentions });
	},
);
