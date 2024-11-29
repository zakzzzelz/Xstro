import * as baileys from 'baileys';
import * as xstro from './events.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import config from '../config.js';
import Message from './class/Base.js';
import { commands } from './handler.js';
import { logger } from './logger.js';
import { handleMessage } from './message.js';
import { loadMessage, saveChat } from './sql/store.js';
import { serialize } from './serialize.js';
import { fancy } from './tools/font.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const connect = async () => {
   let state, saveCreds;
   const sessionPath = path.join(__dirname, '../session');
   if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath, { recursive: true });
   const session = await baileys.useMultiFileAuthState(sessionPath);
   state = session.state;
   saveCreds = session.saveCreds;

   const { version } = await baileys.fetchLatestBaileysVersion();

   const conn = baileys.makeWASocket({
      auth: {
         creds: state.creds,
         keys: baileys.makeCacheableSignalKeyStore(state.keys, logger),
      },
      printQRInTerminal: true,
      logger,
      browser: baileys.Browsers.macOS('Safari'),
      version,
      syncFullHistory: true,
      markOnlineOnConnect: false,
      fireInitQueries: true,
      emitOwnEvents: true,
      getMessage: async (key) => {
         const store = await loadMessage(key.id);
         if (store) return store;
         return { conversation: null };
      },
   });

   conn.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
      if (connection === 'close') {
         lastDisconnect.error?.output?.statusCode !== baileys.DisconnectReason.loggedOut ? connect() : process.exit(0);
      } else if (connection === 'open') {
         const status = `xstro ${config.VERSION}\nprefix: ${config.PREFIX}\nplugins: ${commands.length}\nmode: ${config.MODE}`;
         await conn.sendMessage(conn.user.id, { text: fancy(status) });
         console.log(`Connected`);
         console.log(status);
      } else if (connection === 'connecting') {
         console.log('Connecting...');
      }
   });

   conn.ev.on('creds.update', saveCreds);
   conn.ev.on('chats.update', (chats) => chats.forEach(saveChat));
   conn.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type === 'notify') {
         const __msg = await serialize(JSON.parse(JSON.stringify(messages[0])), conn);
         const __class = new Message(conn, __msg);
         await xstro.chatAi(__msg, conn);
         await xstro.handleViewOnce(__msg, conn, __class);
         if (__msg.from && __msg.body && __msg.isGroup) await xstro.handleAntiWord(conn, __msg);
         if (__msg.from && __msg.body && __msg.isGroup) await xstro.handleAntiLink(conn, __msg);
         if (__msg.from && __msg.isGroup) xstro.handleAutoKick(conn, __msg);
         await handleMessage(__msg, conn, __class);
      }
   });

   conn.ev.on('messages.update', async (updates) => {
      await xstro.handleAntiDelete(conn, updates);
   });

   xstro.handleGroupParticipants(conn);
   xstro.schedules(conn);
   conn.ev.flush();

   return conn;
};

export default connect;
