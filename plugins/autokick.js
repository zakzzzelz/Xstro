import { bot } from '../lib/cmds.js';
import { addToAutoKick, removeFromAutoKick, getAutoKickList, isInAutoKickList } from '../sql/akick.js';

bot(
	{
		pattern: 'autokick',
		isPublic: false,
		isGroup: true,
		desc: 'Setup autokick to automatically kick losers from the group',
	},
	async (message, match) => {
		const groupId = message.jid;
		const userId = await message.thatJid(match);

		const [action] = match.split(' ');

		if ((action === 'add' || action === 'del') && !userId) return await message.send('```AutoKick Command Usage:\n' + '• `.autokick add @user` - Add user to autokick list\n' + '• `.autokick del @user` - Remove user from autokick list\n' + '• `.autokick get` - View current autokick list```');

		if (action === 'add') {
			const isAlreadyInList = await isInAutoKickList(groupId, userId);
			if (isAlreadyInList) return await message.send('_User is already in the autokick list_');

			const added = await addToAutoKick(groupId, userId);
			if (added) await message.send(`_User added to autokick list_`);
		} else if (action === 'del') {
			const removed = await removeFromAutoKick(groupId, userId);
			if (removed) await message.send(`_User removed from autokick list_`);
		} else if (action === 'get') {
			const kickList = await getAutoKickList(groupId);
			if (kickList && kickList.length > 0) {
				const formattedList = kickList.map(jid => `• @${jid.split('@')[0]}`).join('\n');
				await message.send(`\`\`\`Current AutoKick List:\n ${formattedList}\`\`\``, { mentions: kickList });
			} else {
				await message.send('*AutoKick list is empty*');
			}
		} else {
			await message.send('```' + '• Use `.autokick add @user`\n' + '• Use `.autokick del @user`\n' + '• Use `.autokick get````');
		}
	},
);
