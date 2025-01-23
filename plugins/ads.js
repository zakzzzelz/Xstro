import { bot } from '#lib';
import { delay } from 'baileys';

bot(
  {
    pattern: 'advertise',
    public: false,
    isGroup: true,
    desc: 'Share ad messages to all groups',
    type: 'group',
  },
  async (message, match, { groupFetchAllParticipating }) => {
    if (!match) return message.send('_Provide a message to advertise_');

    const groups = await groupFetchAllParticipating();
    const groupIds = Object.values(groups).map((group) => group.id);

    await message.send(`Advertising to ${groupIds.length} groups.`);

    const broadcastMessage = `ADVERTISMENT\n\nINFO:\n\n${adMsg}`;

    for (const groupId of groupIds) {
      await delay(1500);
      await message.send(broadcastMessage, {
        jid: groupId,
        contextInfo: { forwardingScore: 999, isForwarded: true },
      });
    }

    return message.send(`Shared to ${groupIds.length} groups.`);
  }
);
