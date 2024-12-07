import { getProfilePicture, replacePlaceholders } from '../utils.js';
import { numtoId } from '../utils.js';
import { isEnabled, getWelcomeMessage, getGoodByeMessage } from '../../sql/greetings.js';

export const GroupParticipants = conn => {
	conn.ev.on('group-participants.update', async update => {
		const { id, participants, action } = update;

		if (!(await isEnabled(id))) return;

		const groupMetadata = await conn.groupMetadata(id);
		const adminList = groupMetadata.participants?.filter(p => p.admin === 'admin' || p.admin === 'superadmin')?.map(p => `@${p.id.split('@')[0]}`) || [];
		const adminsId = adminList.map(admin => numtoId(admin.replace('@', '')));

		for (const participant of participants) {
			const user = `@${participant.split('@')[0]}`;

			const profilePic = await getProfilePicture(conn, participant);

			const messageOptions = profilePic ? { image: profilePic, mentions: [...participants, ...adminsId] } : { text: '', mentions: [...participants, ...adminsId] };

			if (action === 'add') {
				const welcomeMessage = await getWelcomeMessage(id);
				if (welcomeMessage) {
					const message = replacePlaceholders(welcomeMessage, groupMetadata, user, profilePic, adminList);
					messageOptions.caption = message;
					await conn.sendMessage(id, messageOptions);
				}
			} else if (action === 'remove') {
				const goodbyeMessage = await getGoodByeMessage(id);
				if (goodbyeMessage) {
					const message = replacePlaceholders(goodbyeMessage, groupMetadata, user, profilePic, adminList);
					messageOptions.caption = message;
					await conn.sendMessage(id, messageOptions);
				}
			}
		}
	});
};
