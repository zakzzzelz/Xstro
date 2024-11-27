import { isEnabled, getWelcomeMessage, getGoodByeMessage } from '../sql/greetings.js';
import { getBuffer, numtoId } from '../utils.js';

/**
 * Replace placeholders in a message template with dynamic group or participant data.
 * @param {string} template - The message template.
 * @param {object} groupMetadata - The group metadata object.
 * @param {string} user - The username of the participant.
 * @param {Buffer} profilePic - The profile picture buffer.
 * @param {Array} adminList - List of admin mentions
 * @returns {string} - The message with placeholders replaced.
 */
const replacePlaceholders = (template, groupMetadata, user, profilePic, adminList) => {
  const gname = groupMetadata.subject || '';
  const gdesc = groupMetadata.desc || '';
  const memberCount = groupMetadata.participants?.length || 0;

  return template
    .replace(/@user/g, user)
    .replace(/@gname/g, gname)
    .replace(/@member/g, memberCount.toString())
    .replace(/@admin/g, adminList.join(', '))
    .replace(/@gdesc/g, gdesc)
    .replace(/@pp/g, profilePic ? '' : '');
};

/**
 * Fetch profile picture using Baileys downloadMediaMessage
 * @param {object} conn - The Baileys connection instance
 * @param {string} jid - The JID to fetch PP from
 * @returns {Promise<Buffer|null>}
 */
const getProfilePicture = async (conn, jid) => {
  const ppUrl = await conn.profilePictureUrl(jid, 'image');
  if (!ppUrl) return null;

  const res = await getBuffer(ppUrl);
  return res;
};

/**
 * Handle participant updates for groups.
 * @param {object} conn - The Baileys connection instance.
 */
export const handleGroupParticipants = (conn) => {
  conn.ev.on('group-participants.update', async (update) => {
    const { id, participants, action } = update;

    if (!(await isEnabled(id))) return;

    const groupMetadata = await conn.groupMetadata(id);
    const adminList =
      groupMetadata.participants
        ?.filter((p) => p.admin === 'admin' || p.admin === 'superadmin')
        ?.map((p) => `@${p.id.split('@')[0]}`) || [];
    const adminsId = adminList.map((admin) => numtoId(admin.replace('@', '')));

    for (const participant of participants) {
      const user = `@${participant.split('@')[0]}`;

      const profilePic = await getProfilePicture(conn, participant);

      const messageOptions = profilePic
        ? { image: profilePic, mentions: [...participants, ...adminsId] }
        : { text: '', mentions: [...participants, ...adminsId] };

      if (action === 'add') {
        const welcomeMessage = await getWelcomeMessage(id);
        if (welcomeMessage) {
          const message = replacePlaceholders(
            welcomeMessage,
            groupMetadata,
            user,
            profilePic,
            adminList
          );
          messageOptions.caption = message;
          await conn.sendMessage(id, messageOptions);
        }
      } else if (action === 'remove') {
        const goodbyeMessage = await getGoodByeMessage(id);
        if (goodbyeMessage) {
          const message = replacePlaceholders(
            goodbyeMessage,
            groupMetadata,
            user,
            profilePic,
            adminList
          );
          messageOptions.caption = message;
          await conn.sendMessage(id, messageOptions);
        }
      }
    }
  });
};
