import AntiWord from '../models/AntiWordDB.js';

export const handleAntiWord = async (conn, msg) => {
        const groupId = msg.from;
        const userId = msg.sender;
        const groupMetadata = await conn.groupMetadata(groupId);
        const antiWordConfig = await AntiWord.findOne({ where: { groupId } });

        if (!antiWordConfig?.isEnabled) return;
        if (groupMetadata.participants.some(p => p.id === userId && (p.isAdmin || p.isSuperAdmin))) return;

        const badWords = antiWordConfig.filterWords || [];
        if (!badWords.some(word => msg.body.toLowerCase().includes(word.toLowerCase()))) return;

        await conn.sendMessage(groupId, {
            text: `_@${userId.split('@')[0]}, your message contained prohibited words and was removed._`,
            mentions: [userId],
        });
        await conn.sendMessage(groupId, { delete: msg.key });

        const warnings = antiWordConfig.warnings || {};
        warnings[userId] = (warnings[userId] || 0) + 1;

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
