import baileys, { delay } from 'baileys';
const { generateWAMessageFromContent, getBinaryNodeChild, proto } = baileys;
import { bot } from '#lib';

bot(
  {
    pattern: 'add',
    public: false,
    isGroup: true,
    desc: 'Adds a user to the group',
    type: 'group',
  },
  async (message, match, { groupMetadata, profilePictureUrl, query, relayMessage }) => {
    if (!(await message.getAdmin())) return;

    const jid = await message.ujid(match);
    await delay(3000);
    await message.send(
      '⚠️ Warning: Improper use of this command can lead to account bans! Ensure the recipient has saved your contact.'
    );
    await delay(3000);

    try {
      const pp = await profilePictureUrl(message.jid).catch(() => null);
      const jpegThumbnail = pp ? await (await fetch(pp)).buffer() : Buffer.alloc(0);

      const response = await query({
        tag: 'iq',
        attrs: { type: 'set', xmlns: 'w:g2', to: message.jid },
        content: [{ tag: 'add', attrs: {}, content: [{ tag: 'participant', attrs: { jid } }] }],
      });

      const add = getBinaryNodeChild(response, 'add');
      const userNode = getBinaryNodeChild(add, 'participant');
      const content = getBinaryNodeChild(userNode, 'add_request');
      const inviteCode = content.attrs.code;
      const inviteExpiration = content.attrs.expiration;

      const groupName = (await groupMetadata(message.jid)).subject;
      const caption = `Join ${groupName}`;

      const groupInvite = generateWAMessageFromContent(
        message.jid,
        proto.Message.fromObject({
          groupInviteMessage: {
            groupJid: message.jid,
            inviteCode,
            inviteExpiration,
            groupName,
            caption,
            jpegThumbnail,
          },
        }),
        { userJid: jid }
      );

      await relayMessage(jid, groupInvite.message, {
        messageId: groupInvite.key.id,
      });
      return message.send('Invite Sent');
    } catch {
      return message.send(
        'Unable to send an invite. Ensure the recipient has saved your contact to avoid account bans.'
      );
    }
  }
);
