import { bot } from '#lib';
import { addWelcome, delWelcome, isWelcomeOn, addGoodbye, delGoodBye, isGoodByeOn } from '#sql';

bot(
  {
    pattern: 'welcome',
    public: false,
    isGroup: true,
    desc: 'SetUp Welcome Messages For Group',
    type: 'group',
  },
  async (message, match, { jid, prefix }) => {
    if (!match)
      return message.send(
        `Welcome Messages Setup\n\n_${prefix}welcome on_\nEnable\n_${prefix}welcome "your message"_\nCustom\n_${prefix}welcome off_\nDisable\nVisit Wiki: https://github.com/AstroX11/Xstro/wiki/Welcome-&&-Goodbye-Messages`
      );
    if (match === 'on') {
      if (await isWelcomeOn(jid)) return message.send('Welcome Already Enabled');
      await addWelcome(jid, true, null);
      return message.send(`Welcome enabled, use ${prefix}welcome to customize`);
    }
    if (match === 'off') {
      if (!(await isWelcomeOn(jid))) return message.send('Welcome Already Disabled');
      await delWelcome(message.jid);
      return message.send('Welcome Disabled');
    }
    await addWelcome(jid, true, match);
    return message.send('Custom Welcome Message Set');
  }
);

bot(
  {
    pattern: 'goodbye',
    public: false,
    isGroup: true,
    desc: 'SetUp Goodbye Messages For Group',
    type: 'group',
  },
  async (message, match, { jid, prefix }) => {
    if (!match)
      return message.send(
        `Goodbye Messages Setup\n\n_${prefix}goodbye on_\nEnable\n_${prefix}goodbye "your message"_\nCustom\n_${prefix}goodbye off_\nDisable\nVisit Wiki: https://github.com/AstroX11/Xstro/wiki/Welcome-&&-Goodbye-Messages`
      );
    if (match === 'on') {
      if (await isGoodByeOn(jid)) return message.send('Goodbye Already Enabled');
      await addGoodbye(jid, true, null);
      return message.send(`Goodbye enabled, use ${prefix}goodbye to customize`);
    }
    if (match === 'off') {
      if (!(await isGoodByeOn(jid))) return message.send('Goodbye Already Disabled');
      await delGoodBye(jid);
      return message.send('Goodbye Disabled');
    }
    await addGoodbye(jid, true, match);
    return message.send('Custom Goodbye Message Set');
  }
);
