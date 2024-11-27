import { getKicks } from "../sql/akick.js";

const monitoredGroups = new Set(); // Track groups already being monitored

/**
 * Periodically checks and auto-kicks users based on the AutoKick list.
 * @param {object} conn - Baileys client instance.
 * @param {object} msg - Serialized message object.
 */
export function handleAutoKick(conn, msg) {
    const groupId = msg.from;

    // Ensure it's a group message and not already monitoring this group
    if (!groupId.endsWith('@g.us') || monitoredGroups.has(groupId)) return;

    monitoredGroups.add(groupId); // Mark group as being monitored

    setInterval(async () => {
        try {
            const groupMeta = await conn.groupMetadata(groupId);
            const participants = groupMeta.participants.map(p => p.id);

            for (const userJid of participants) {
                const kicks = await getKicks(groupId, userJid);
                if (kicks.length > 0) {
                    try {
                        // Send warning message before kicking
                        await conn.sendMessage(groupId, {
                            text: `@${userJid.split('@')[0]} is detected from AutoKick, now kicking loser.`,
                            mentions: [userJid],
                        });

                        // Kick the user
                        await conn.groupParticipantsUpdate(groupId, [userJid], 'remove');
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
