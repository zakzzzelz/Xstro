import { bot } from '../lib/plugins.js';
import { addAKick, delKick, getKicks } from './sql/akick.js';

bot(
	{
		pattern: 'akick',
		isPublic: false,
		isGroup: true,
		desc: 'AutoKicks a member from the group.',
		type: 'group',
	},
	async (message, match) => {
		if (!message.isAdmin) return message.send('```You are not an Admin```');
		if (!message.isBotAdmin) return message.send('```I am not an Admin```');

		const groupId = message.jid;

		const jid = await message.thatJid(match);
		if (!jid) return message.send("_Reply, tag, or provide the participant's number!_");

		const action = match?.split(' ')[0].toLowerCase();

		if (action === 'add') {
			const added = await addAKick(groupId, jid);
			if (added) {
				return message.send('_User added to auto-kick list._');
			} else {
				return message.send('_User is already on the list._');
			}
		} else if (action === 'del') {
			const deleted = await delKick(groupId, jid);
			if (deleted) {
				return message.send('_User removed from auto-kick list._');
			} else {
				return message.send('_User was not on the list._');
			}
		} else if (action === 'get') {
			const kicks = await getKicks(groupId, jid);
			if (kicks.length > 0) {
				return message.send(`_Users in auto-kick list:_\n${kicks.map(k => `• ${k.userJid}`).join('\n')}`);
			} else {
				return message.send('_No users found in the auto-kick list._');
			}
		} else {
			return message.send('_Invalid action! Use add, del, or get._');
		}
	},
);
