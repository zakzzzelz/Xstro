import AntiWord from '../models/AntiWordDB.js';

export const handleAntiWord = async (conn, msg) => {
	const groupId = msg.from;
	const userId = msg.sender;
	const antiWordConfig = await AntiWord.findOne({ where: { groupId } });

	if (!antiWordConfig?.isEnabled) return;
	if (msg.isAdmin) return;

	const badWords = antiWordConfig.filterWords || [];
	if (!badWords.some(word => msg.body.toLowerCase().includes(word.toLowerCase()))) return;

	const warnings = antiWordConfig.warnings || {};
	warnings[userId] = (warnings[userId] || 0) + 1;

	const remainingWarnings = 5 - warnings[userId];

	await conn.sendMessage(groupId, {
		text: `_@${userId.split('@')[0]}, your message contained prohibited words and was removed._\n_You have ${remainingWarnings} warnings left!_`,
		mentions: [userId],
	});
	await conn.sendMessage(groupId, { delete: msg.key });

	if (warnings[userId] >= 5) {
		await conn.groupParticipantsUpdate(groupId, [userId], 'remove');
		delete warnings[userId];
		await conn.sendMessage(groupId, {
			text: `_@${userId.split('@')[0]} has been removed for exceeding the warning limit._`,
			mentions: [userId],
		});
	}

	await AntiWord.update({ warnings }, { where: { groupId } });
};
