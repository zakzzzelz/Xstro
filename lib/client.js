import {
  makeWASocket,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  DisconnectReason,
  Browsers,
  useMultiFileAuthState,
  isJidBroadcast,
} from 'baileys';
import { EventEmitter } from 'events';
import Message from './class.js';
import { manageProcess, deepClone, toJid } from '#utils';
import { AntiCall, Greetings, GroupEventPartial, GroupEvents } from '#bot';
import { loadMessage, saveMessage, getName, getConfig, addSudo } from '#sql';
import { upserts, Plugins, serialize, logger, listenersPlugins, commands } from '#lib';
import { LANG } from '#lang';
import { config } from '#config';

EventEmitter.defaultMaxListeners = 10000;
process.setMaxListeners(10000);

export const client = async () => {
  const session = await useMultiFileAuthState('./session');
  const { state, saveCreds } = session;
  const { version } = await fetchLatestBaileysVersion();

  const conn = makeWASocket({
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    printQRInTerminal: false,
    logger,
    browser: Browsers.windows('Desktop'),
    version,
    syncFullHistory: true,
    emitOwnEvents: true,
    generateHighQualityLinkPreview: true,
    getMessage: async (key) => {
      const store = await loadMessage(key.id);
      return store ? store : { conversation: null };
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
      await AntiCall(events.call, conn);
    }

    if (events['connection.update']) {
      const { connection, lastDisconnect } = events['connection.update'];
      switch (connection) {
        case 'connecting':
          console.log(LANG.START_BOOT);
          break;

        case 'close':
          lastDisconnect.error?.output?.statusCode === DisconnectReason.loggedOut
            ? manageProcess()
            : client();
          break;

        case 'open':
          addSudo(toJid(conn.user.id));
          const cmds = commands.filter(
            (cmd) =>
              cmd.pattern &&
              !cmd.dontAddCommandList &&
              !cmd.pattern.toString().includes('undefined')
          ).length;
          await conn.sendMessage(conn.user.id, {
            text: `\`\`\`${LANG.CONNECTED}\n\nVersion: ${config.VERSION}\n\nPlugins: ${cmds}\`\`\``,
          });
          console.log(LANG.PROCESS_STARTED);
          break;
      }
    }

    if (events['creds.update']) await saveCreds();

    if (events['messages.upsert']) {
      const { messages, type } = events['messages.upsert'];
      if (type !== 'notify') return;

      const { autoRead, autoStatusRead, autolikestatus } = await getConfig();

      for (const message of messages) {
        const msg = await serialize(deepClone(JSON.parse(JSON.stringify(message))), conn);
        const data = new Message(conn, msg);
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
          listenersPlugins(data, msg, conn),
          Plugins(data, msg, conn),
          saveMessage(msg),
          upserts(msg),
        ]);
      }
    }

    if (events['group-participants.update'] || events['groups.update']) {
      if ((await getConfig()).disablegc) return;

      if (events['group-participants.update']) {
        const { id, participants, action, author } = events['group-participants.update'];
        const event = { Group: id, participants, action, by: author };
        await Promise.all([Greetings(event, conn), GroupEvents(event, conn)]);
      }

      if (events['groups.update']) {
        for (const update of events['groups.update']) await GroupEventPartial(update, conn);
      }
    }
  });

  return conn;
};
