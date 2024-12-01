import config from '../config.js';
import { numtoId } from './utils.js';
import { isSudo } from './sql/sudo.js';
import { isBanned } from './sql/ban.js';
import { fancy } from './font.js';

const commands = [];
const prefixPattern = config.PREFIX ? config.PREFIX.split('').join('|') : '';

function isValidPrefix(userInput) {
   const prefixPattern = config.PREFIX.split('')
      .map((char) => `\\${char}`)
      .join('|');
   const regex = new RegExp(`^(${prefixPattern})$`);
   return regex.test(userInput);
}

function bot(cmdInfo, func) {
   cmdInfo.function = func;
   cmdInfo.pattern = new RegExp(`^(${prefixPattern})\\s*(${cmdInfo.pattern})(?:\\s+(.*))?$`, 'i');
   cmdInfo.isPublic = cmdInfo.isPublic || false;
   cmdInfo.dontAddCommandList = cmdInfo.dontAddCommandList || false;
   cmdInfo.type = cmdInfo.type || 'misc';

   commands.push(cmdInfo);
   return cmdInfo;
}

const Plugins = async (msg, conn, ev) => {
   if (!msg.body) return;
   for (const cmd of commands) {
      const match = msg.body.match(cmd.pattern);
      if (match) {
         const commandMsg = { ...msg, prefix: match[1], command: `${match[1]}${match[2]}` };
         if (config.CMD_REACT) await ev.react('🕺🏼');
         if (config.READ_CMD) await conn.readMessages([msg.key]);
         await handleCommand(cmd, commandMsg, conn, ev);
      } else if (cmd.on) {
         await handleCommand(cmd, msg, conn, ev);
      }
   }
};

async function handleCommand(cmd, msg, conn, ev) {
   if (cmd.on) cmd.function(ev, msg.body || '', msg, conn);

   const sender = msg.sender ? numtoId(msg.sender).split('@')[0] : null;
   const owner = numtoId(ev.user).split('@')[0];
   const sudo = await isSudo(msg.sender, owner);
   const banned = await isBanned(msg.sender);
   const mode = config.MODE === 'private';

   const match = msg.body.match(cmd.pattern);
   const prefix = match[1];
   const args = match[3] ?? '';

   if (!isValidPrefix(prefix)) return;
   if (mode && !sudo) return;
   if (banned) return await ev.send(fancy('you are banned from using commands!'));
   if (!mode && !cmd.isPublic && !sudo) return await ev.send(fancy('for my owners!'));

   try {
      await cmd.function(ev, args, msg, conn);
   } catch (err) {
      const cmdName = cmd.pattern.toString().split(/\W+/)[2] || cmd.on;
      const errMsg = `─━❲ ERROR REPORT ❳━─\nFROM: @${sender}\nMESSAGE: ${err.message}\nCMD: ${cmdName}`;
      await conn.sendMessage(ev.user, { text: '```' + errMsg + '```', mentions: [numtoId(sender)] }, { quoted: msg });
   }
}

export { commands, bot, Plugins };
