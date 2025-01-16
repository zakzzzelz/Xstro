import {
  makeWASocket,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  DisconnectReason,
  Browsers,
  useMultiFileAuthState,
  isJidBroadcast,
} from 'baileys';
import { ProxyAgent } from 'proxy-agent';
import { EventEmitter } from 'events';
import Message from './class.js';
import { proxy, manageProcess } from '#utils';
import { AntiCall, AntiDelete, Greetings, GroupEventPartial, GroupEvents } from '#bot';
import { loadMessage, saveMessage, getGroupMetadata, getName } from '#sql';
import { getConfigValues, upserts, Plugins, serialize, logger } from '#lib';

EventEmitter.defaultMaxListeners = 2000;
process.setMaxListeners(2000);

export const client = async () => {
  const session = await useMultiFileAuthState('./session');
  const { state, saveCreds } = session;
  const { version } = await fetchLatestBaileysVersion();

  const conn = makeWASocket({
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    printQRInTerminal: true,
    logger,
    agent: new ProxyAgent(`http://${await proxy()}`),
    browser: Browsers.windows('Desktop'),
    version,
    keepAliveIntervalMs: 5000,
    syncFullHistory: true,
    defaultQueryTimeoutMs: 30000,
    retryRequestDelayMs: 5000,
    markOnlineOnConnect: false,
    fireInitQueries: true,
    emitOwnEvents: true,
    generateHighQualityLinkPreview: true,
    getMessage: async (key) => {
      const store = await loadMessage(key.id);
      return store ? store : { conversation: null };
    },
    cachedGroupMetadata: async (jid) => {
      const store = await getGroupMetadata(jid);
      return store || null;
    },
    patchMessageBeforeSending: (message) => {
      const requiresPatch = !!(
        message.buttonsMessage ||
        message.templateMessage ||
        message.listMessage ||
        message.scheduledCallCreationMessage ||
        message.callLogMesssage
      );
      if (requiresPatch) {
        message = {
          viewOnceMessage: {
            message: {
              messageContextInfo: {
                deviceListMetadataVersion: 2,
                deviceListMetadata: {},
              },
              ...message,
            },
          },
        };
      }

      return message;
    },
  });

  conn.loadMessage = loadMessage.bind(conn);
  conn.getName = getName.bind(conn);

  conn.ev.process(async (events) => {
    if (events.call) {
      for (const call of events.call) {
        await AntiCall(call, conn);
      }
    }

    if (events['connection.update']) {
      const { connection, lastDisconnect } = events['connection.update'];
      switch (connection) {
        case 'connecting':
          console.log('Connecting...');
          break;

        case 'close':
          lastDisconnect.error?.output?.statusCode === DisconnectReason.loggedOut
            ? manageProcess()
            : client();
          break;

        case 'open':
          const web = version.join('.');
          await conn.sendMessage(conn.user.id, {
            text: `\`\`\`Bot Connected\n${web}\`\`\``,
          });
          console.log(`Connected`);
          break;
      }
    }

    if (events['creds.update']) {
      await saveCreds();
    }

    if (events['messages.upsert']) {
      const { messages, type } = events['messages.upsert'];
      if (type !== 'notify') return;

      const { autoRead, autoStatusRead, autolikestatus } = await getConfigValues();

      for (const message of messages) {
        const msg = await serialize(JSON.parse(JSON.stringify(message, null, 2)), conn);
        if (autoRead) await conn.readMessages([msg.key]);
        if (autoStatusRead && isJidBroadcast(msg.from)) await conn.readMessages([msg.key]);
        if (autolikestatus && isJidBroadcast(msg.from)) {
          await conn.sendMessage(
            msg.from,
            { react: { key: msg.key, text: '💚' } },
            { statusJidList: [message.key.participant, conn.user.id] }
          );
        }
        await Promise.all([
          Plugins(msg, conn, new Message(conn, msg)),
          saveMessage(msg),
          upserts(msg),
        ]);
      }
    }

    if (events['messages.update']) {
      await AntiDelete(conn, events['messages.update']);
    }

    if (events['group-participants.update']) {
      const { id, participants, action, author } = events['group-participants.update'];
      if ((await getConfigValues()).disablegc) return;

      const event = {
        Group: id,
        participants: participants,
        action: action,
        by: author,
      };
      await Promise.all([Greetings(event, conn), GroupEvents(event, conn)]);
    }

    if (events['groups.update']) {
      if ((await getConfigValues()).disablegc) return;

      for (const update of events['groups.update']) {
        await GroupEventPartial(update, conn);
      }
    }
  });

  return conn;
};
