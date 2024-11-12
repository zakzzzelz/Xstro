import { bot } from '../lib/client/plugins.js';

bot(
	{
		pattern: 'rpp',
		isPublic: false,
		desc: 'Removes Profile Picture',
		type: 'whatsapp',
	},
	async message => {
		await message.client.removeProfilePicture(message.user);
		return message.sendReply('_Profile Picture Removed!_');
	},
);
