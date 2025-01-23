import { bot } from '#lib';
import { setAntiCall, getAntiCall } from '#sql';

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
