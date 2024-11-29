import { bot } from '../lib/handler.js';
import { serialize } from '../lib/serialize.js';
import { loadMessage } from '../lib/sql/store.js';
import { numtoId } from '../lib/utils.js';

let autobioActive = false;
let autobioInterval;

bot(
   {
      pattern: 'autobio ?(.*)',
      isPublic: false,
      desc: 'Automatically update your WhatsApp bio every 5 minutes. Use "on" to start and "off" to stop.',
      type: 'whatsapp',
   },
   async (message, match) => {
      const action = match?.toLowerCase();
      const updateBio = async () => {
         const timestamp = new Date().toLocaleString();
         const newBio = `This is auto bio updated by Wasi - ${timestamp}`; // Custom bio
         try {
            await message.client.updateProfileStatus(newBio);
            console.log(`[Autobio] Bio updated: ${newBio}`);
         } catch (error) {
            console.error('[Autobio] Failed to update bio:', error);
         }
      };

      if (action === 'on') {
         if (autobioActive) {
            return message.sendReply('_Autobio is already active!_');
         }
         autobioActive = true;
         await updateBio(); // Immediate bio update
         message.sendReply('_Autobio activated! Bio will be updated every 5 minutes._');

         autobioInterval = setInterval(updateBio, 5 * 60 * 1000); // Every 5 minutes
      } else if (action === 'off') {
         if (!autobioActive) {
            return message.sendReply('_Autobio is not active!_');
         }
         clearInterval(autobioInterval);
         autobioActive = false;
         message.sendReply('_Autobio deactivated!_');
      } else {
         return message.sendReply('_Use "autobio on" to activate or "autobio off" to deactivate._');
      }
   }
);
