import { bot } from '../lib/client/plugins.js';

bot(
	{
		pattern: 'setpp',
		isPublic: false,
		desc: 'Set Your Profile Picture',
		type: 'whatsapp',
	},
	async message => {
		if (!message.quoted?.image) return message.sendReply('_Reply An Image_');
		const img = await message.download();
		await message.client.updateProfilePicture(message.jid, img);
		return await message.sendReply('_Profile Picture Updated_');
	},
);
