import { bot } from '../lib/client/plugins.js';

bot(
	{
		pattern: 'blocklist',
		isPublic: false,
		desc: 'Fetches BlockList',
		type: 'whatsapp',
	},
	async message => {
		const blocklist = await message.client.fetchBlocklist();
		if (blocklist.length > 0) {
			const mentions = blocklist.map(number => `${number}`);
			const formattedList = blocklist.map(number => `• @${number.split('@')[0]}`).join('\n');
			await message.sendReply(`*_Blocked contacts:_*\n\n${formattedList}`, { mentions });
		} else {
			await message.sendReply('_No blocked Numbers!_');
		}
	},
);
