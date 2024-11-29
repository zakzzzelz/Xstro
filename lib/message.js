import { handleCommand } from './handler.js';
import { commands } from './handler.js';
import config from '../config.js';
import { logMessages } from './logger.js';

export const handleMessage = async (msg, conn, __events) => {
   if (!msg) return;
   if (config.AUTO_READ) await conn.readMessages([msg.key]);
   if (config.AUTO_STATUS_READ && msg.from === 'status@broadcast') await conn.readMessages([msg.key]);

   for (let i = 0; i < commands.length; i++) {
      const { pattern, on } = commands[i];
      if (!msg.body || !pattern) continue;

      const match = msg.body.match(pattern);
      if (match) {
         if (config.CMD_REACT) await conn.sendMessage(msg.from, { react: { text: '🎶', key: msg.key } });
         await handleCommand(commands[i], { ...msg, prefix: match[1], command: `${match[1]}${match[2]}` }, conn, __events);
         continue;
      }
      if (on) await handleCommand(commands[i], msg, conn, __events);
   }

   if (config.LOGGER) await logMessages(msg, conn);
};
