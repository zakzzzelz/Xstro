import { bot } from '#lib';
import { setAntilink, getAntilink, removeAntilink } from '#sql';

bot(
  {
    pattern: 'antilink',
    public: false,
    isGroup: true,
    desc: 'Setup Antilink for Groups',
    type: 'group',
  },
  async (message, match, { jid, prefix }) => {
    if (!(await message.getAdmin())) return;
    if (!match)
      return message.send(
        `ANTILINK SETUP\n\n${prefix}antilink on\n${prefix}antilink set delete | kick | warn\n${prefix}antilink off`
      );
    const args = match.toLowerCase().trim().split(' ');
    const action = args[0];
    if (action === 'on') {
      if (await getAntilink(jid, 'on')) return message.send('Antilink is already on');
      return message.send(
        (await setAntilink(jid, 'on', ''))
          ? 'Antilink has been turned ON'
          : 'Failed to turn on Antilink'
      );
    }
    if (action === 'off') {
      await removeAntilink(jid, 'on');
      await removeAntilink(jid, 'action');
      return message.send('Antilink has been turned OFF');
    }
    if (action === 'set') {
      if (args.length < 2)
        return message.send(`Please specify an action: ${prefix}antilink set delete | kick | warn`);
      const setAction = args[1];
      if (!['delete', 'kick', 'warn'].includes(setAction))
        return message.send('Invalid action. Choose delete, kick, or warn.');
      const existingConfig = await getAntilink(jid, 'on');
      if (existingConfig && existingConfig.action === setAction)
        return message.send(`Antilink action is already set to ${setAction}`);
      return message.send(
        (await setAntilink(jid, 'on', setAction))
          ? `Antilink action set to ${setAction}`
          : 'Failed to set Antilink action'
      );
    }
    if (action === 'get') {
      const status = await getAntilink(jid, 'on');
      const actionConfig = await getAntilink(jid, 'on');
      return message.send(
        `Antilink Configuration:\nStatus: ${status ? 'ON' : 'OFF'}\nAction: ${actionConfig ? actionConfig.action : 'Not set'}`
      );
    }
    message.send(`Use ${prefix}antilink for usage.`);
  }
);
