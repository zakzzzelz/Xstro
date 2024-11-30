import * as baileys from 'baileys';
import * as xstro from './events.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import config from '../config.js';
import Message from './class/Base.js';
import { logger } from './logger.js';
import { commands, Plugins } from './plugins.js';
import { loadMessage, saveMessage } from './sql/store.js';
import { serialize } from './serialize.js';
import { fancy } from './font.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const connect = async () => {
   const sessionPath = path.join(__dirname, '../session');
   if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath, { recursive: true });
   const session = await baileys.useMultiFileAuthState(sessionPath);
   const { state, saveCreds } = session;
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
   conn.ev.on('messages.upsert', async ({ messages, type }) => {
      const msg = await serialize(JSON.parse(JSON.stringify(messages[0])), conn);
      const ev = new Message(conn, msg);
      if (type === 'notify') {
         await Plugins(msg, conn, ev);
         await saveMessage(msg, msg.pushName);
         await xstro.handleViewOnce(msg, conn, ev);
         if (msg.from && msg.body && msg.isGroup) await xstro.handleAntiWord(conn, msg);
         if (msg.from && msg.body && msg.isGroup) await xstro.handleAntiLink(conn, msg);
         if (msg.from && msg.isGroup) xstro.handleAutoKick(conn, msg);
         if (config.AUTO_READ) await conn.readMessages([msg.key]);
         if (config.AUTO_STATUS_READ && msg.from === 'status@broadcast') await conn.readMessages([msg.key]);
         if (config.LOGGER) await xstro.logMessages(msg, conn);
         await xstro.chatAi(msg, conn);
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
