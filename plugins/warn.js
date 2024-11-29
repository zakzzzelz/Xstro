import { bot } from '../lib/handler.js';
import { getWarn, resetWarn, addWarn } from '../lib/sql/warn.js';
import { numtoId } from '../lib/utils.js';

bot(
   {
      pattern: 'warn',
      isPublic: false,
      desc: 'Warns a user',
      type: 'user',
   },
   async (message, match, m, client) => {
      let jid;
      let reason;

      if (message.isGroup) {
         if (message.reply_message) {
            jid = message.reply_message.sender;
         } else if (message.mention && message.mention[0]) {
            jid = message.mention[0];
         } else if (match) {
            jid = numtoId(match.split(';')[0].trim());
            reason = match.split(';')[1]?.trim() || 'No reason provided';
         }
      } else {
         jid = m.from;
         reason = match || 'No reason provided';
      }

      if (!jid || jid === '') return message.sendReply('_Reply, tag, or give me the participant number_');

      const response = await addWarn(jid, reason);

      if (response.success) {
         const warnMsg = `@${jid.split('@')[0]} *has been warned.*\n\n*Warnings:* ${response.warnings}\n*Reason:* ${reason}`;
         await message.sendReply(warnMsg, { mentions: [jid] });

         if (response.warnings > 3) {
            if (message.isGroup) {
               if (m.isAdmin || m.isBotAdmin) {
                  try {
                     await client.groupParticipantsUpdate(message.from, [jid], 'remove');
                     await client.updateBlockStatus(jid, 'block');
                     await resetWarn(jid);
                     await message.sendReply(`@${jid.split('@')[0]} *was removed from the group and blocked for exceeding the warning limit.*`, { mentions: [jid] });
                  } catch (error) {
                     await message.sendReply(`*Failed to remove or block @${jid.split('@')[0]}:* ${error.message}`, { mentions: [jid] });
                  }
               } else {
                  await message.sendReply('_Cannot take action as I am not an admin or the command issuer is not an admin._');
               }
            } else {
               await client.updateBlockStatus(m.from, 'block');
               await resetWarn(jid);
               await message.sendReply(`*User @${jid.split('@')[0]} was blocked for exceeding the warning limit.*`, { mentions: [jid] });
            }
         }
      } else {
         await message.sendReply('_Failed to add a warning_');
      }
   }
);

bot(
   {
      pattern: 'rwarn',
      isPublic: false,
      desc: 'Resets a user’s warnings',
      type: 'user',
   },
   async (message, match, m) => {
      let jid;
      if (message.reply_message) {
         jid = message.reply_message.sender;
      } else if (message.mention && message.mention[0]) {
         jid = message.mention[0];
      } else if (match) {
         jid = numtoId(match);
      } else if (!message.isGroup) {
         jid = m.from;
      }
      if (!jid) return message.sendReply('_Reply, tag, or give me the participant number_');

      await resetWarn(jid);
      await message.sendReply(`@${jid.split('@')[0]}'s warnings have been reset.`, {
         mentions: [jid],
      });
   }
);

bot(
   {
      pattern: 'getwarns',
      isPublic: false,
      desc: 'Checks a user’s warnings',
      type: 'user',
   },
   async (message, match, m) => {
      let jid;
      if (message.reply_message) {
         jid = message.reply_message.sender;
      } else if (message.mention && message.mention[0]) {
         jid = message.mention[0];
      } else if (match) {
         jid = numtoId(match);
      } else if (!message.isGroup) {
         jid = m.from;
      }
      if (!jid) return message.sendReply('_Reply, tag, or give me the participant number_');

      const response = await getWarn(jid);

      if (response.success) {
         const warnMsg = `@${jid.split('@')[0]} has ${response.warnings} warning(s).\n\n${response.reason || 'No reasons provided.'}`;
         await message.sendReply(warnMsg, { mentions: [jid] });
      } else {
         await message.sendReply('_Failed to retrieve warnings_');
      }
   }
);
