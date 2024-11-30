import config from '../config.js';
import { bot } from '../lib/plugins.js';
import { extractUrlFromMessage, getBuffer, getJson } from '../lib/utils.js';

const { API_KEY } = config;
const base_url = `https://api.giftedtech.my.id/api/tools/`;

bot(
   {
      pattern: 'getpp',
      isPublic: true,
      desc: 'Get Another Person Profile Image',
      type: 'tools',
   },
   async (message) => {
      if (message.isGroup) {
         const user = message.reply_message?.sender || message.mention[0];
         if (!user) return message.sendReply('_Reply Or Tag Someone_');
         try {
            const pp = await message.client.profilePictureUrl(user, 'image');
            const res = await getBuffer(pp);
            await message.send(res);
         } catch {
            message.sendReply('_No Profile Photo_');
         }
      } else {
         try {
            const pp = await message.client.profilePictureUrl(message.jid, 'image');
            const res = await getBuffer(pp);
            await message.send(res);
         } catch {
            message.sendReply('_No Profile Photo_');
         }
      }
   }
);

bot(
   {
      pattern: 'obfuscate',
      isPublic: true,
      desc: 'Obfuscates A Js code',
      type: 'tools',
   },
   async (message, match) => {
      const code = match || message.reply_message?.text;
      if (!code) return message.sendReply('```Provide JS Code```');
      const res = await getJson(`${base_url}encrypt?apikey=${API_KEY}&code=${code}`);
      return await message.sendReply(res.encrypted_code);
   }
);
