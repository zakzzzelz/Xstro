import { getContentType, getDevice } from 'baileys';
import { saveMessage } from './sql/store.js';
import { getGroupMetadata, numtoId } from './utils.js';

/**
 * Serializes a WhatsApp message with additional metadata.
 * @param {Object} msg - The incoming message object.
 * @param {Object} conn - The Baileys Connection Object
 * @returns {Promise<Object>} - The serialized message object with metadata.
 */
export async function serialize(msg, conn) {
  if (!msg || !conn) return;
  const obj = JSON.parse(JSON.stringify(msg));
  if (obj.key) {
    // Basic Messages Data
    obj.message = obj;
    obj.id = obj.key.id;
    obj.isSelf = obj.key.fromMe;
    obj.from = obj.key.remoteJid;
    obj.isGroup = obj.from.endsWith('@g.us'); // Identifying if the message is from a group
    obj.sender = obj.isGroup ? obj.key.participant : obj.isSelf ? conn.user.id : obj.from;
    obj.device = getDevice(obj.key.id); // Identifies the device from which the message was sent
  }

  if (obj.isGroup) {
    // If the message is from a group, fetch group metadata
    const groupMetadata = await getGroupMetadata(conn, obj.from);
    const owner = numtoId(conn.user.id.split(':')[0]); // Get the owner's ID for admin check
    const user = numtoId(obj.sender); // Get the user ID for checking admin status
    if (groupMetadata) {
      // Check if the user is an admin in the group
      const participants = groupMetadata.participants || [];
      obj.isAdmin = participants.some(
        (p) => p.id === user && (p.admin === 'admin' || p.admin === 'superadmin')
      );
      // Check if the bot itself is an admin
      obj.isBotAdmin = participants.some(
        (p) => p.id === owner && (p.admin === 'admin' || p.admin === 'superadmin')
      );
    } else {
      obj.isAdmin = false;
      obj.isBotAdmin = false; // Default to no admin rights if no group metadata is available
    }
  } else {
    // If the message is not from a group, default admin checks to false
    obj.isAdmin = false;
    obj.isBotAdmin = false;
  }

  if (obj.message) {
    // Get the content type of the message (e.g., text, image, video, etc.)
    obj.type = getContentType(obj.message);

    try {
      // Mentions are part of the message metadata, used for tagging
      obj.mentions = obj.message[obj.type]?.contextInfo?.mentionedJid || [];
    } catch {
      obj.mentions = false; // Default to false if no mentions are found
    }

    try {
      const quoted = obj.message[obj.type]?.contextInfo?.quotedMessage;
      if (quoted) {
        let quotedSender =
          obj.message[obj.type]?.contextInfo?.participant ||
          obj.message[obj.type]?.contextInfo?.remoteJid ||
          obj.from;
        let quotedType;

        if (quoted['viewOnceMessageV2']) {
          const quotedViewOnce = quoted.viewOnceMessageV2.message;
          const quotedViewOnceType = Object.keys(quotedViewOnce)[0];

          obj.quoted = {
            type: 'viewOnce',
            stanzaId: obj.message[obj.type]?.contextInfo?.stanzaId,
            sender: quotedSender,
            message: quotedViewOnce,
            body:
              quotedViewOnce[quotedViewOnceType]?.text ||
              quotedViewOnce[quotedViewOnceType]?.caption ||
              quotedViewOnce[quotedViewOnceType]?.description ||
              '',
          };
        } else {
          quotedType = Object.keys(quoted)[0];

          obj.quoted = {
            type: 'normal',
            stanzaId: obj.message[obj.type]?.contextInfo?.stanzaId,
            sender: quotedSender,
            message: quoted,
            body:
              quoted[quotedType]?.text ||
              quoted[quotedType]?.caption ||
              quoted[quotedType]?.description ||
              '',
          };
        }
        obj.quoted.isSelf = obj.quoted.sender === conn.user.id;
        obj.quoted.mtype = quotedType;
        obj.quoted.text = obj.quoted.body;
        obj.quoted.key = {
          remoteJid: obj.from,
          fromMe: obj.quoted.isSelf,
          id: obj.quoted.stanzaId,
          participant: obj.quoted.sender,
        };
      }
    } catch {
      obj.quoted = null;
    }

    if (obj.message['ephemeralMessage']) {
      const ephemeralType = Object.keys(obj.message.ephemeralMessage.message)[0];
      obj.body =
        obj.body ||
        obj.message.ephemeralMessage.message[ephemeralType]?.text ||
        obj.message.ephemeralMessage.message[ephemeralType]?.caption ||
        obj.message.ephemeralMessage.message[ephemeralType]?.description ||
        '';

      obj.quoted = {
        type: 'ephemeral',
        stanzaId: obj.key.id,
        sender: obj.sender,
        message: obj.message.ephemeralMessage.message[ephemeralType],
        key: {
          remoteJid: obj.from,
          fromMe: obj.isSelf,
          id: obj.key.id,
          participant: obj.sender,
        },
      };
    } else {
      obj.body =
        obj.body ||
        obj.message.conversation ||
        obj.message[obj.type]?.text ||
        obj.message[obj.type]?.caption ||
        obj.message[obj.type]?.description ||
        false;
    }
  }

  msg.reply = async (message, opts = {}) => {
    const content = await conn.sendMessage(
      obj.from,
      { text: message.toString(), ...opts },
      { quoted: opts.quoted }
    );
    return serialize(content, conn);
  };

  await saveMessage(obj, obj.pushName); // Save the deep-cloned message to the database
  return obj; // Return the deep-cloned message object
}
