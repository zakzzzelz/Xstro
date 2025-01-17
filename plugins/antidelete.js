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
    if (match !== 'on' && match !== 'off') {
      return message.send('_Use "on" or "off" to configure antidelete._');
    }
    const status = getAntiDelete();
    const newState = match === 'on';
    if (status === newState) {
      return message.send(`_Antidelete is already ${newState ? 'on' : 'off'}._`);
    }
    setAntiDelete(newState);
    return message.send(`_Antidelete is now ${newState ? 'on' : 'off'}._`);
  }
);
