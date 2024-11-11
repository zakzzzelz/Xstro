import { bot } from '../lib/client/plugins.js';

bot(
	{
		pattern: 'leave',
		isPublic: false,
		desc: 'leave a group',
		type: 'group',
	},
	async message => {
		await message.sendReply('_Left Group_');
		return message.client.groupParticipantsUpdate(message.jid, [message.user], 'remove');
	},
);
