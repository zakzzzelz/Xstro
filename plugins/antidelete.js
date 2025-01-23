import { bot } from '#lib';
import { getAntiDelete, setAntiDelete } from '#sql';

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
