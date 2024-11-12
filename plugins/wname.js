import { bot } from '../lib/client/plugins.js';

bot(
	{
		pattern: 'myname',
		isPublic: false,
		desc: 'Changes your WhatsApp Name',
		type: 'whatsapp',
	},
	async (message, match) => {
		const newName = match || message.quoted?.text;
		if (!newName) return message.sendReply('_Provide A New Name_');
		if (newName > 25) return message.sendReply('_Only 25 letters allowed bro_');
		await message.client.updateProfileName(newName);
		return message.sendReply('_Name Updated!_');
	},
);
