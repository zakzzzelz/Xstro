import { bot } from '#lib';

bot(
  {
    pattern: 'tagall',
    public: true,
    isGroup: true,
    desc: 'Tag all participants in the group',
    type: 'group',
  },
  async (message, match) => {
    const msg = match || message.reply_message?.text;
    if (!msg) return message.send('_You must provide a reason for tagging everyone._');
    const participants = await message.client.groupMetadata(message.jid);
    const participantJids = participants.participants.map((p) => p.id);
    const tagMsg =
      `*Reason:* ${msg}\n\n` + participantJids.map((jid) => `@${jid.split('@')[0]}`).join('\n');
    await message.client.sendMessage(message.jid, {
      text: tagMsg,
      mentions: participantJids,
    });
  }
);

bot(
  {
    pattern: 'tag',
    public: true,
    isGroup: true,
    desc: 'Tag Anyone with Any Kind of Message',
    type: 'group',
  },
  async (message, match) => {
    if (!match && !message.reply_message)
      return message.send('_Reply any Message or Give Me Text_');
    const participants = await message.client.groupMetadata(message.jid);
    const participantJids = participants.participants.map((p) => p.id);
    if (match && !message.reply_message) {
      await message.send(match, { mentions: participantJids });
      return;
    }
    if (!match && message.reply_message) {
      const quotedMessage = message.data.quoted.message;
      const typeOfMessage = getContentType(quotedMessage);
      const objectAction = quotedMessage?.[typeOfMessage];

      if (objectAction) {
        let taggedMessage = {
          [typeOfMessage]: {
            ...objectAction,
            contextInfo: {
              ...objectAction.contextInfo,
              mentionedJid: objectAction.contextInfo?.mentionedJid || participantJids,
            },
          },
        };
        if (typeOfMessage === 'conversation' && typeof objectAction === 'string') {
          taggedMessage[typeOfMessage] = objectAction;
        }
        await message.client.relayMessage(message.jid, taggedMessage, {});
      } else {
        await message.client.relayMessage(message.jid, quotedMessage, {});
      }
    }
  }
);
