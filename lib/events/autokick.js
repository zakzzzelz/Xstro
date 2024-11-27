import { getKicks, delKick } from "../sql/akick.js";

/**
 * Handles auto-kicking users based on the AutoKick list.
 * @param {object} msg - Serialized message object.
 * @param {object} conn - Baileys client instance.
 */
export async function handleAutoKick(msg, conn) {
    if (!msg.from.endsWith('@g.us')) return; // Ensure this is a group message

    const groupId = msg.from;
    const userJid = msg.sender;

    // Check if the user is in the AutoKick list
    const kicks = await getKicks(groupId, userJid);
    if (kicks.length > 0) {
        try {
            // Kick the user from the group
            await conn.groupParticipantsUpdate(groupId, [userJid], 'remove');

            // Remove the user from the AutoKick list after kicking
            await delKick(groupId, userJid);
            console.log(`Auto-kicked user: ${userJid} from group: ${groupId}`);
        } catch (error) {
            console.error(`Failed to auto-kick user ${userJid}:`, error);
        }
    }
}
