import { bot } from '#lib';
import { aliveMessage, setAliveMsg } from '#sql';
import { LANG } from '#lang';

bot(
  {
    pattern: 'alive',
    public: true,
    desc: 'Check if bot is alive',
    type: 'user',
  },
  async (message, match) => {
    if (match) {
      await setAliveMsg(match);
      return message.send('Alive Updated');
    }
    const msg = await aliveMessage(message);
    const mentionData = {
      mentions: [message.sender],
      contextInfo: { mentionedJid: [message.sender] },
      externalAdReply: {
        title: LANG.BOT_NAME,
        body: 'ɪ ᴀᴍ ᴀʟɪᴠᴇ & ʀᴜɴɴɪɴɢ',
        mediaType: 1,
        thumbnailUrl: LANG.THUMBNAIL,
        sourceUrl: LANG.REPO_URL,
        showAdAttribution: true,
      },
    };

    return await message.send(msg, { ...mentionData });
  }
);
