import { bot } from '#lib';
import {
  getAntiDelete,
  setAntiDelete,
  setAntiCall,
  getAntiCall,
  setViewOnce,
  isViewOnceEnabled,
} from '#sql';

bot(
  {
    pattern: 'antidelete',
    public: false,
    desc: 'Setup Antidelete',
    type: 'user',
  },
  async (message, match) => {
    if (!['on', 'off'].includes(match)) return message.send('Use on | off');
    const newState = match === 'on';
    if (getAntiDelete() === newState) return message.send(`Antidelete is already ${match}.`);
    setAntiDelete(newState);
    message.send(`Antidelete is now turned ${match}.`);
  }
);

bot(
  {
    pattern: 'anticall',
    public: false,
    desc: 'Simple AntiCall Setup',
    type: 'user',
  },
  async (message, match, { prefix }) => {
    if (!match) {
      const config = await getAntiCall();
      return message.send(
        `AntiCall status: ${config.status}, Action: ${config.action}\n${prefix}anticall [on/off/set]`
      );
    }

    const [command, param] = match.split(' ');

    switch (command) {
      case 'on':
        await setAntiCall('on');
        return message.send('AntiCall enabled');

      case 'off':
        await setAntiCall('off');
        return message.send('AntiCall disabled');

      case 'set':
        if (!['block', 'reject'].includes(param))
          return message.send('Invalid action. Use "block" or "reject"');

        await setAntiCall(null, param);
        return message.send(`AntiCall action set to ${param}`);

      default:
        return message.send('Invalid command');
    }
  }
);

bot(
  {
    pattern: 'antivv',
    public: false,
    desc: 'Toggle Anti ViewOnce',
    type: 'settings',
  },
  async (message, match, { prefix }) => {
    const cmd = match.trim().toLowerCase();
    if (!['on', 'off'].includes(cmd)) return await message.send(`_Use ${prefix}antivv on | off_`);

    const currentStatus = isViewOnceEnabled();
    const newStatus = cmd === 'on';
    if (currentStatus === newStatus)
      return await message.send(`_AntiViewOnce is already ${cmd.toLowerCase()}_`);

    setViewOnce(newStatus);
    return await message.send(`_AntiViewOnce turned ${cmd.toLowerCase()}_`);
  }
);
