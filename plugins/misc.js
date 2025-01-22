import { bot } from '#lib';
import { evaluate } from 'mathjs';
import { extractUrl, readmore } from '#utils';

bot(
  {
    pattern: 'readmore',
    public: true,
    desc: 'Adds *readmore* in given text.',
    type: 'misc',
  },
  async (message, match) => {
    if (!match) return await message.send('*Give me text!*');
    const result = readmore(match);
    if (!result) return await message.send('*Format: text1|text2*');
    return await message.send(result);
  }
);

bot(
  {
    pattern: 'mp4url',
    public: true,
    desc: 'Get direct mp4 url from video message',
    type: 'misc',
  },
  async (message, match) => {
    if (!match || !/^https?:\/\/[^\s$.?#].[^\s]*$/.test(match))
      return message.send('*Provide URL*');
    const url = extractUrl(match);
    return await message.client.sendMessage(message.jid, {
      video: { url: url },
      caption: '*HERE WE GO*',
    });
  }
);

bot(
  {
    pattern: 'mp3url',
    public: true,
    desc: 'Get direct mp3 URL from an audio message',
    type: 'misc',
  },
  async (message, match) => {
    if (!match || !/^https?:\/\/[^\s$.?#].[^\s]*$/.test(match))
      return message.send('*Provide URL*');
    const url = extractUrl(match);
    return await message.client.sendMessage(message.jid, {
      audio: { url: url },
      mimetype: 'audio/mpeg',
    });
  }
);

bot(
  {
    pattern: 'math',
    public: true,
    desc: 'Solve a Maths Expression',
    type: 'misc',
  },
  async (message, match) => {
    if (!match) return await message.send('*Example: `.math 2 + 2`*');
    const msg = await message.send('*Calculating...*');
    try {
      const result = evaluate(match);
      return await msg.edit(`Result: ${result}`);
    } catch {
      return await msg.edit(`_Syntax Error_`);
    }
  }
);

bot(
  {
    pattern: 'getbio',
    public: true,
    type: 'misc',
    desc: 'Get the WhatsApp Bio of a User',
  },
  async (message, match) => {
    const jid = await message.getUserJid(match);
    const { status, setAt } = await message.client.fetchStatus(jid);
    if (status && setAt) {
      await message.send(`\`\`\`Bio: ${status}\nSetAt: ${setAt}\`\`\``);
    } else {
      message.send(`_User's settings doesn't allow me to_`);
    }
  }
);
