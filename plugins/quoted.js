import { serialize } from '../lib/serialize.js';
import { bot } from '../lib/client/plugins.js';
import { loadMessage } from '../lib/sql/store.js';

bot(
	{
		pattern: 'quoted',
		isPublic: false,
		desc: 'quoted message',
		type: 'whatsapp',
	},
	async (message, match) => {
		if (!message.quoted) return await message.sendReply('_Reply A Message_');
		let key = message.quoted.key.id;
		let msg = await loadMessage(key);
		if (!msg) return await message.sendReply('_Message not found maybe bot might not be running at that time_');
		msg = await serialize(JSON.parse(JSON.stringify(msg.message)), message.client);
		if (!msg.quoted) return await message.sendReply('_No quoted message found_');
		await message.saveNForward(message.jid, msg.quoted);
	},
);
