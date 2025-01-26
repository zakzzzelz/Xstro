import { bot } from '#lib';
import { delAntibot, getAntibot, isSudo, setAntibot } from '#sql';

bot(
  {
    pattern: 'antibot',
    public: true,
    isGroup: true,
    type: 'group',
  },
  async (message, match) => {
    if (!['on', 'off'].includes(match)) return message.send('Use: antibot on | off');
    const enabled = await getAntibot(message.jid);

    if (match === 'on') {
      if (enabled) return message.send('Antibot is already enabled.');
      await setAntibot(message.jid, true);
      return message.send('Antibot enabled for this group.');
    }

    if (!enabled) return message.send('Antibot is already disabled.');
    await delAntibot(message.jid);
    return message.send('Antibot disabled for this group.');
  }
);

bot(
  {
    on: 'anti-bot',
    dontAddCommandList: true,
  },
  async (message, { groupParticipantsUpdate }) => {
    if (
      !message.isGroup ||
      !(await getAntibot(message.jid)) ||
      message.isAdmin ||
      !message.isBotAdmin ||
      isSudo(message.sender)
    )
      return;

    if (message.bot) {
      await Promise.all([
        message.send(`@${message.sender.split('@')[0]} has been kicked for using a bot.`, {
          mentions: [message.sender],
        }),
        groupParticipantsUpdate(message.jid, [message.sender], 'remove'),
      ]);
    }
  }
);
