import { bot } from '#lib';
import { config } from '#config';
import { aliveMessage, setAliveMsg } from '#sql';

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
    const botInfo = config.BOT_INFO.split(';')[1];
    const mentionData = {
      mentions: [message.sender],
      contextInfo: { mentionedJid: [message.sender] },
    };

    return await message.send(
      botInfo || msg,
      botInfo ? { ...mentionData, caption: msg } : mentionData
    );
  }
);
