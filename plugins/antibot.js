import { bot } from '../lib/plugins.js';
import { isAdmin, numtoId } from '../lib/utils.js';

let antibotActive = false;

bot(
  {
    pattern: 'antibot ?(.*)',
    isPublic: false,
    desc: 'Activate or deactivate anti-bot mode. Automatically kicks other bots if detected in the group.',
    type: 'group',
  },
  async (message, match) => {
    if (!message.isGroup) return message.sendReply('_This command can only be used in groups!_');

    const groupId = message.jid;

    const action = match?.toLowerCase();
    if (action === 'on') {
      if (antibotActive) {
        return message.sendReply('_Antibot mode is already active!_');
      }
      antibotActive = true;
      return message.sendReply('_Antibot mode activated! I will monitor and kick bot users detected in this group._');
    } else if (action === 'off') {
      if (!antibotActive) {
        return message.sendReply('_Antibot mode is not active!_');
      }
      antibotActive = false;
      return message.sendReply('_Antibot mode deactivated! I will no longer monitor or kick bot users._');
    } else {
      return message.sendReply('_Use "antibot on" to activate or "antibot off" to deactivate._');
    }
  }
);

bot(
  {
    pattern: '.*',
    isPublic: true,
    desc: 'Monitors the group for bot users when antibot mode is active.',
    type: 'group',
  },
  async (message) => {
    if (!antibotActive) return;

    if (!message.isGroup) return;
    const botPrefixDetected = /^[,.\!@#%^&*()/\\]/.test(message.body); // Adjusted for other bot prefixes
    if (botPrefixDetected) {
      const senderJid = message.sender;
      const senderName = message.pushName;

      const hasAdminRole = await isAdmin(message.jid, message.user, message.client);
      if (!hasAdminRole) {
        return message.sendReply(
          `I detected a bot user (${senderName}). Please give me admin role to kick them out!`
        );
      }

      const senderIsBot = senderJid.includes('bot') || senderJid.includes('@g.us'); // Basic check for bot users
      if (senderIsBot) {
        try {
          await message.client.groupParticipantsUpdate(message.jid, [senderJid], 'remove');
          return message.sendReply(`_Detected and kicked a bot user: ${senderName}_`);
        } catch (error) {
          console.error(`[Antibot] Failed to kick bot user: ${senderJid}`, error);
          return message.sendReply('_Failed to kick the bot user. Ensure I have the necessary permissions!_');
        }
      }
    }
  }
);
