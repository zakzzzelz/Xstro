import { getKicks } from '#sql/akick';
import { isJidGroup } from 'baileys';

const monitoredGroups = new Set();

export async function AutoKick(conn, msg) {
	const groupId = msg.from;

	if (!isJidGroup(groupId) || monitoredGroups.has(groupId)) return;

	monitoredGroups.add(groupId);

	setInterval(async () => {
		const groupMeta = await conn.groupMetadata(groupId);
		const participants = groupMeta.participants.map(p => p.id);

		for (const wanted of participants) {
			const kicks = await getKicks(groupId, wanted);
			if (kicks.length > 0) {
				await conn.sendMessage(groupId, {
					text: `\`\`\`@${wanted.split('@')[0]} is detected from AutoKick, now kicking loser.\`\`\``,
					mentions: [wanted],
				});
				await conn.groupParticipantsUpdate(groupId, [wanted], 'remove');
			}
		}
	}, 10000);
}
