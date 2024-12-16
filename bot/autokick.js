import { getAutoKickList } from '../sql/akick.js';
import { getGroupMetadata } from '../sql/store.js';

const lastRunTimes = new Map();

export async function AutoKick(msg) {
	const groupJid = msg.from;
	const currentTime = Date.now();

	const lastRunTime = lastRunTimes.get(groupJid) || 0;
	if (currentTime - lastRunTime < 10000) return [];

	lastRunTimes.set(groupJid, currentTime);

	const metadata = await getGroupMetadata(groupJid);
	const members = metadata.participants || [];
	const kicklist = await getAutoKickList(groupJid);

	if (!kicklist) return [];

	const membersToKick = members.filter(member => kicklist.includes(member.id) && member.admin === null);

	for (const member of membersToKick) {
		await msg.client.groupParticipantsUpdate(groupJid, [member.id], 'remove');
		await msg.send(`\`\`\`@${member.id.split('@')[0]} kick due to autokick, kicked loser\`\`\``, { mentions: [member.id] });
	}

	return membersToKick;
}
