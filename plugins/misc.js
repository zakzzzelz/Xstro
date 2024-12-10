import { getJson } from 'utils';
import { bot } from '../lib/plugins.js';
import { setAnti } from '../sql/antidel.js';
import { disableAntiVV, enableAntiVV, getStatus } from '../sql/antivv.js';

bot(
	{
		pattern: 'antidel',
		isPublic: false,
		desc: 'Configure AntiDelete',
		type: 'misc',
	},
	async (message, match) => {
		if (!match) return message.send(`_${pushName} Wrong Usage!_\n${prefix}antidel on | off`);

		const chatId = message.jid;
		const status = match.toLowerCase() === 'on';

		const setStatus = await setAnti(chatId, status);
		if (setStatus) {
			return message.send(`_Anti-delete has been turned ${status ? 'on' : 'off'}._`);
		} else {
			return message.send('_Failed to update anti-delete status. Please try again._');
		}
	},
);

bot(
	{
		pattern: 'antivv',
		isPublic: false,
		desc: 'Configure AntiViewonce',
		type: 'misc',
	},
	async (message, match) => {
		const args = match?.trim()?.toLowerCase();
		if (!args) {
			const status = await getStatus();
			if (!status) return await message.send('_Anti-ViewOnce is currently disabled._');
			return await message.send(`_Anti-ViewOnce is enabled for: ${status === 'all' ? 'all chats' : status === 'dm' ? 'direct messages' : 'group chats'}._`);
		}
		if (['all', 'dm', 'gc'].includes(args)) {
			await enableAntiVV(args);
			return await message.send(`_Anti-ViewOnce enabled for ${args === 'all' ? 'all chats' : args === 'dm' ? 'direct messages' : 'group chats'}._`);
		}
		if (args === 'disable') {
			await disableAntiVV();
			return await message.send('_Anti-ViewOnce has been disabled._');
		}
		return await message.send('_Use:\n- `antivv all` to enable for all chats\n- `antivv dm` to enable for direct messages\n- `antivv gc` to enable for group chats\n- `antivv disable` to disable Anti-ViewOnce._');
	},
);

bot(
	{
		pattern: 'pair',
		isPublic: true,
		desc: 'Get Your Pairing Code Now',
		type: 'misc',
	},
	async (message, match) => {
		const jid = await message.thatJid(match);
		if (!jid) return message.send('_Give me the number that needs pairing code_');
		const id = jid.split('@')[0];
		const msg = await message.send('*Getting Pairing Code*');
		const res = await getJson(`https://xstrosession.onrender.com/pair?phone=${id}`);
		if (!res.code) return message.send('*unable to get a pairing code, try again!*');
		return await msg.edit('```Pairing CODE:\n' + res.code + '```');
	},
);

bot(
	{
		pattern: 'support',
		isPublic: true,
		desc: 'Sends developer support information ',
		type: 'misc',
	},
	async message => {
		const supportMessage = `╭─── *🔰 DEVS SUPPORT 🔰* ────╮  
│  
│ *📱 WhatsApp Channel:* https://whatsapp.com/channel/0029VaDK8ZUDjiOhwFS1cP2j \n
│ *💬 Testing Group:*   https://chat.whatsapp.com/HIvICIvQ8hL4PmqBu7a2C6\n
│ *🐙 GitHub Repository:* https://github.com/AstroX11/Xstro.git \n
│ *✉️ Support Email:* support@xstrobot  \n
│  
│ *⚠️ Note:* Please contact us for any issues. We respond within 24 hours.  
│  
╰───────────────────────────╯  
`;
		await message.send(supportMessage);
	},
);
