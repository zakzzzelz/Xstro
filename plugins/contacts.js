import { bot } from '#lib';
import { getContacts, saveContact } from '#sql';

bot(
  {
    pattern: 'contacts',
    public: false,
    desc: 'Get all contacts saved by bot',
    type: 'contacts',
  },
  async (message) => {
    const contacts = await getContacts();
    if (!contacts.length) return await message.send('_No contacts saved yet_');
    const contactList = contacts.map((c) => `*${c.name}:* _${c.jid.split('@')[0]}_`).join('\n');
    return await message.send(`*ᴄᴏɴᴛᴀᴄᴛs sᴀᴠᴇᴅ ʙʏ ʙᴏᴛ*\n\n${contactList}`);
  }
);
