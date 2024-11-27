import { getKicks, delKick } from "../sql/akick.js";

/**
 * Periodically checks and auto-kicks users based on the AutoKick list.
 * @param {object} conn - Baileys client instance.
 * @param {string} groupId - Group JID.
 */
export function handleAutoKick(conn, groupId) {
    setInterval(async () => {
        try {
            const groupMeta = await conn.groupMetadata(groupId);
            const participants = groupMeta.participants.map(p => p.id);

            for (const userJid of participants) {
                const kicks = await getKicks(groupId, userJid);
                if (kicks.length > 0) {
                    try {
                        // Kick the user
                        await conn.groupParticipantsUpdate(groupId, [userJid], 'remove');
                        
                        // Remove from AutoKick list after successful kick
                        await delKick(groupId, userJid);
                        console.log(`Auto-kicked user: ${userJid} from group: ${groupId}`);
                    } catch (error) {
                        console.error(`Failed to auto-kick user ${userJid}:`, error);
                    }
                }
            }
        } catch (error) {
            console.error(`Error fetching group metadata for ${groupId}:`, error);
        }
    }, 5000); // Runs every 5 seconds
}
