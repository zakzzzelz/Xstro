import { getJson } from 'xstro-utils';
import { bot } from '#lib';

bot(
	{
		pattern: 'pair',
		public: true,
		desc: 'Get Your Pairing Code Now',
	},
	async (message, match) => {
		const jid = await message.getUserJid(match);
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
		public: true,
		desc: 'Sends developer support information ',
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
