import { getAutoKickList } from '../sql/akick.js';
import { getGroupMetadata } from '../sql/store.js';

const lastRunTimes = new Map();

export async function AutoKick(msg) {
	const groupJid = msg.from;
	const currentTime = Date.now();

	const lastRunTime = lastRunTimes.get(groupJid) || 0;
	if (currentTime - lastRunTime < 10000) return [];

	lastRunTimes.set(groupJid, currentTime);

	try {
		const metadata = await getGroupMetadata(groupJid);
		const members = metadata.participants || [];
		const kicklist = await getAutoKickList(groupJid);

		if (!kicklist) return [];

		const membersToKick = members.filter(member => kicklist.includes(member.id) && member.admin === null);

		const kickResults = [];

		for (const member of membersToKick) {
			try {
				// Kick the user
				await msg.client.groupParticipantsUpdate(groupJid, [member.id], 'remove');

				// Send kick notification
				await msg.send(`\`\`\`@${member.id.split('@')[0]} kick due to autokick, kicked loser\`\`\``, { mentions: [member.id] });

				kickResults.push({
					id: member.id,
					kicked: true,
				});
			} catch (kickError) {
				console.error(`Failed to kick user ${member.id}:`, kickError);

				kickResults.push({
					id: member.id,
					kicked: false,
					error: kickError.message,
				});
			}
		}

		return kickResults;
	} catch (error) {
		console.error('Error in AutoKick function:', error);
		return [];
	}
}
