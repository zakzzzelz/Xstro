import config from '../config.js';
import {utils} from '../lib/utils.js'
import { bot } from '../lib/plugins.js';

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
            const res = await utils.getBufferFromUrl(pp);
            await message.send(res);
         } catch {
            message.sendReply('_No Profile Photo_');
         }
      } else {
         try {
            const pp = await message.client.profilePictureUrl(message.jid, 'image');
            const res = await utils.getBufferFromUrl(pp);
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
      const res = await utils.getJsonFromUrl(`${base_url}encrypt?apikey=${API_KEY}&code=${code}`);
      return await message.sendReply(res.encrypted_code);
   }
);

bot(
   {
      pattern: 'surl',
      isPublic: true,
      desc: 'Shorterns A Url',
      type: 'tools',
   },
   async (message, match) => {
      const url = utils.extractUrlFromString(match || message.reply_message?.text);
      if (!url) return message.sendReply('_No Url found_');
      const msg = await message.sendReply('*wait*');
      const res = await utils.getJsonFromUrl(`${config.BASE_API_URL}/api/shorten?url=${url}`);
      return await msg.edit(res.link);
   }
);
