import AntiWord from '../models/AntiWordDB.js';

export const handleAntiWord = async (conn, msg) => {
	const groupId = msg.chatId;
	const userId = msg.sender;
	const isAdmin = await conn.groupMetadata(groupId).then(metadata => metadata.participants.some(participant => participant.id === userId && participant.isAdmin));

	if (isAdmin) return;

	const antiWordConfig = await AntiWord.findOne({ where: { groupId } });
	if (!antiWordConfig || !antiWordConfig.isEnabled) return;

	const badWords = antiWordConfig.filterWords || [];
	const messageContainsBadWord = badWords.some(word => msg.body.toLowerCase().includes(word.toLowerCase()));

	if (messageContainsBadWord) {
		await conn.sendMessage(groupId, { text: `_@${userId.split('@')[0]}, your message contained prohibited words and was removed._`, mentions: [userId] });
		await conn.sendMessage(groupId, { delete: msg.key });

		const warnings = antiWordConfig.warnings;
		warnings[userId] = (warnings[userId] || 0) + 1;

		if (warnings[userId] >= 5) {
			await conn.groupParticipantsUpdate(groupId, [userId], 'remove');
			delete warnings[userId];
			await conn.sendMessage(groupId, { text: `_@${userId.split('@')[0]} has been removed for exceeding the warning limit._`, mentions: [userId] });
		}

		await AntiWord.update({ warnings }, { where: { groupId } });
	}
};
