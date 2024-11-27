import { getContentType, getDevice } from 'baileys';
import { saveMessage } from './sql/store.js';
import { getGroupMetadata, numtoId } from './utils.js';

export async function serialize(msg, conn) {
  if (!msg || !conn) return;

  if (msg.key) {
    msg.id = msg.key.id;
    msg.isSelf = msg.key.fromMe;
    msg.from = msg.key.remoteJid;
    msg.isGroup = msg.from.endsWith('@g.us');
    msg.sender = msg.isGroup ? msg.key.participant : msg.isSelf ? conn.user.id : msg.from;
    msg.device = getDevice(msg.key.id);
    msg.message = msg.message;
  }

  if (msg.isGroup) {
    const groupMetadata = await getGroupMetadata(conn, msg.from);
    const owner = numtoId(conn.user.id.split(':')[0]);
    const user = numtoId(msg.sender);
    if (groupMetadata) {
      const participants = groupMetadata.participants || [];
      msg.isAdmin = participants.some(
        (p) => p.id === user && (p.admin === 'admin' || p.admin === 'superadmin')
      );
      msg.isBotAdmin = participants.some(
        (p) => p.id === owner && (p.admin === 'admin' || p.admin === 'superadmin')
      );
    } else {
      msg.isAdmin = false;
      msg.isBotAdmin = false;
    }
  } else {
    msg.isAdmin = false;
    msg.isBotAdmin = false;
  }

  if (msg.message) {
    msg.type = getContentType(msg.message);

    try {
      msg.mentions = msg.message[msg.type]?.contextInfo?.mentionedJid || [];
    } catch {
      msg.mentions = false;
    }

    try {
      const contextInfo = msg.message[msg.type]?.contextInfo;
      const quoted = contextInfo?.quotedMessage;

      if (quoted) {
        const fullQuotedMessage = {
          ...msg.message[msg.type],
          contextInfo: contextInfo,
          quotedMessage: quoted
        };

        msg.quoted = {
          fullMessage: fullQuotedMessage,
          type: 'normal',
          stanzaId: contextInfo?.stanzaId,
          sender: contextInfo?.participant || contextInfo?.remoteJid || msg.from,
          message: quoted,
          body:
            quoted?.extendedTextMessage?.text ||
            quoted?.conversation ||
            quoted?.imageMessage?.caption ||
            quoted?.videoMessage?.caption ||
            '',
        };

        const quotedType = Object.keys(quoted)[0];
        msg.quoted.mtype = quotedType;

        switch (quotedType) {
          case 'imageMessage':
            msg.quoted.imageUrl = quoted.imageMessage.url;
            msg.quoted.imageCaption = quoted.imageMessage.caption;
            break;
          case 'videoMessage':
            msg.quoted.videoUrl = quoted.videoMessage.url;
            msg.quoted.videoCaption = quoted.videoMessage.caption;
            break;
          case 'audioMessage':
            msg.quoted.audioUrl = quoted.audioMessage.url;
            msg.quoted.audioDuration = quoted.audioMessage.duration;
            break;
          case 'documentMessage':
            msg.quoted.documentUrl = quoted.documentMessage.url;
            msg.quoted.documentTitle = quoted.documentMessage.title;
            break;
        }

        msg.quoted.isSelf = msg.quoted.sender === conn.user.id;
        msg.quoted.text = msg.quoted.body;
        msg.quoted.key = {
          remoteJid: msg.from,
          fromMe: msg.quoted.isSelf,
          id: msg.quoted.stanzaId,
          participant: msg.quoted.sender,
        };
      }
    } catch (error) {
      console.error('Error processing quoted message:', error);
      msg.quoted = null;
    }

    if (msg.message['ephemeralMessage']) {
      const ephemeralType = Object.keys(msg.message.ephemeralMessage.message)[0];
      msg.body =
        msg.body ||
        msg.message.ephemeralMessage.message[ephemeralType]?.text ||
        msg.message.ephemeralMessage.message[ephemeralType]?.caption ||
        msg.message.ephemeralMessage.message[ephemeralType]?.description ||
        '';

      msg.quoted = {
        type: 'ephemeral',
        stanzaId: msg.key.id,
        sender: msg.sender,
        message: msg.message.ephemeralMessage.message[ephemeralType],
        key: {
          remoteJid: msg.from,
          fromMe: msg.isSelf,
          id: msg.key.id,
          participant: msg.sender,
        },
      };
    } else {
      msg.body =
        msg.body ||
        msg.message.conversation ||
        msg.message[msg.type]?.text ||
        msg.message[msg.type]?.caption ||
        msg.message[msg.type]?.description ||
        false;
    }
  }

  msg.reply = async (message, opts = {}) => {
    const content = await conn.sendMessage(
      msg.from,
      { text: message.toString(), ...opts },
      { quoted: opts.quoted }
    );
    return serialize(content, conn);
  };

  await saveMessage(msg, msg.pushName);
  return msg;
}