import { bot } from '../lib/exec.js';
import { getSudo, delSudo, addSudo, isSudo } from '../sql/sudo.js';

bot(
	{
		pattern: 'setsudo',
		isPublic: false,
		desc: 'Add User to Sudo list',
		type: 'user',
	},
	async (message, match) => {
		const jid = await message.thatJid(match);
		if (await isSudo(jid, message.user)) return message.send('_Already Sudo User_');
		const sudolist = await addSudo(jid);
		return message.send(sudolist);
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
		const jid = await message.thatJid(match);
		const rsudo = await delSudo(jid);
		return message.send(rsudo);
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
		if (sudoList === '_No Sudo Numbers_') return message.send('*_No Sudo Users_*');
		const sudoNumbers = sudoList.split('\n').map(number => number.split('@')[0]);
		const formattedSudoList = '*_Sudo Users_*\n\n' + sudoNumbers.map((number, index) => `${index + 1}. @${number}`).join('\n');
		const mentions = sudoNumbers.map(number => `${number}@s.whatsapp.net`);
		return message.send(formattedSudoList, { mentions: mentions });
	},
);
