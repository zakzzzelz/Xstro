import { bot } from '#lib';
import { devs, toJid } from '#utils';
import { getJson } from 'xstro-utils';
import { config } from '#config';

bot(
  {
    pattern: 'report',
    public: true,
    desc: 'Request Feature or Report Bugs',
    type: 'help',
  },
  async (message, match) => {
    if (!match || match.split(' ').length < 5)
      return message.send('Please provide a reason with at least 5 words to report a bug.');
    const helpers = await devs();
    const errorReport = `BUG REPORT
FROM: @${message.sender.split('@')[0]}
MESSAGE: \n${match}
`;
    for (const dev of helpers) {
      await message.send(errorReport, {
        jid: toJid(dev),
        mentions: [message.sender],
      });
    }
  }
);

bot(
  {
    pattern: 'repo',
    public: true,
    desc: 'Github Repository Link',
    type: 'help',
  },
  async (message, _, { jid, sendMessage }) => {
    const res = await getJson(`https://api.github.com/repos/AstroX11/Xstro`);
    const helpMsg = `σρєи ѕσυя¢є ωнαтѕαρρ вσт\n\nмα∂є ву αѕтяσχ11\nfσякѕ: ${res.forks_count}\nѕтαяѕ: ${res.stargazers_count}`;
    return await sendMessage(jid, {
      text: helpMsg,
      contextInfo: {
        externalAdReply: {
          title: 'xsᴛʀᴏ ᴍᴅ',
          body: 'ᴛᴀᴘ ʜᴇʀᴇ sᴏᴜʀᴄᴇ ᴄᴏᴅᴇ',
          mediaType: 1,
          thumbnailUrl: `https://avatars.githubusercontent.com/u/188756392?v=4`,
          sourceUrl: `https://github.com/AstroX11/Xstro`,
          showAdAttribution: true,
        },
      },
    });
  }
);

bot(
  {
    pattern: 'pair',
    public: true,
    desc: 'Get Your Pairing Code Now',
    type: 'help',
  },
  async (message, match) => {
    const jid = await message.ujid(match);
    if (!jid) return message.send('_Give me the number that needs pairing code_');
    const id = jid.split('@')[0];
    const msg = await message.send('*Getting Pairing Code*');
    const res = await getJson(`https://xstrosession.koyeb.app/pair?phone=${id}`);
    if (!res.code) return message.send('*unable to get a pairing code, try again!*');
    return await msg.edit(`*${res.code}*`);
  }
);

bot(
  {
    pattern: 'support',
    public: true,
    desc: 'Sends developer support information',
    type: 'help',
  },
  async (message, _, { jid, sendMessage }) => {
    const contacts = devs.map((dev) => {
      return {
        vcard: `BEGIN:VCARD
VERSION:3.0
FN:Developer ${dev}
ORG:${config.BOT_INFO.split(';')[0]}
TEL;type=CELL;type=VOICE;waid=${dev}:${dev}
END:VCARD`,
      };
    });
    return await sendMessage(jid, {
      contacts: {
        displayName: 'Developer Support',
        contacts: contacts,
      },
    });
  }
);
