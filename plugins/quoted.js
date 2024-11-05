import { serialize } from '../lib/serialize.js';
import { bot } from '../lib/plugins.js';
import { loadMessage } from '../lib/models/store.js';

bot(
	{
		pattern: 'quoted',
		desc: 'quoted message',
		type: 'whatsapp',
	},
	async (message, match) => {
		if (!message.reply_message) return await message.reply('_Reply A Message_');
		let key = message.quoted.key.id;
		let msg = await loadMessage(key);
		if (!msg) return await message.sendReply('_Message not found maybe bot might not be running at that time_');
		msg = await serialize(JSON.parse(JSON.stringify(msg.message)), message.client);
		if (!msg.quoted) return await message.reply('No quoted message found');
		await message.saveNForward(message.jid, msg.quoted);
	},
);
