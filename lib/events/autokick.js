import { getKicks } from '../sql/akick.js';

const monitoredGroups = new Set(); // Track groups already being monitored

/**
 * Periodically checks and auto-kicks users based on the AutoKick list.
 * @param {object} conn - Baileys client instance.
 * @param {object} msg - Serialized message object.
 */
export function handleAutoKick(conn, msg) {
  const groupId = msg.from;
  if (!groupId.endsWith('@g.us') || monitoredGroups.has(groupId)) return;

  monitoredGroups.add(groupId);

  setInterval(async () => {
      const groupMeta = await conn.groupMetadata(groupId);
      const participants = groupMeta.participants.map((p) => p.id);

      for (const userJid of participants) {
        const kicks = await getKicks(groupId, userJid);
        if (kicks.length > 0) {
            await conn.sendMessage(groupId, {
              text: `@${userJid.split('@')[0]} is detected from AutoKick, now kicking loser.`,
              mentions: [userJid],
            });
            await conn.groupParticipantsUpdate(groupId, [userJid], 'remove');
        }
      }

  }, 5000);
}
