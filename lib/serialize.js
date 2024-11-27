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

  if (msg.key) {
    // Basic Messages Data lol my head aches
    msg.message = msg;
    msg.id = msg.key.id;
    msg.isSelf = msg.key.fromMe;
    msg.from = msg.key.remoteJid;
    msg.isGroup = msg.from.endsWith('@g.us'); // Identifying if the message is from a group
    msg.sender = msg.isGroup ? msg.key.participant : msg.isSelf ? conn.user.id : msg.from;
    msg.device = getDevice(msg.key.id); // Identifies the device from which the message was sent
  }

  if (msg.isGroup) {
    // If the message is from a group, fetch group metadata
    const groupMetadata = await getGroupMetadata(conn, msg.from);
    const owner = numtoId(conn.user.id.split(':')[0]); // Get the owner's ID for admin check
    const user = numtoId(msg.sender); // Get the user ID for checking admin status
    if (groupMetadata) {
      // Check if the user is an admin in the group
      const participants = groupMetadata.participants || [];
      msg.isAdmin = participants.some(
        (p) => p.id === user && (p.admin === 'admin' || p.admin === 'superadmin')
      );
      // Check if the bot itself is an admin
      msg.isBotAdmin = participants.some(
        (p) => p.id === owner && (p.admin === 'admin' || p.admin === 'superadmin')
      );
    } else {
      msg.isAdmin = false;
      msg.isBotAdmin = false; // Default to no admin rights if no group metadata is available
    }
  } else {
    // If the message is not from a group, default admin checks to false
    msg.isAdmin = false;
    msg.isBotAdmin = false;
  }

  if (msg.message) {
    // Get the content type of the message (e.g., text, image, video, etc.)
    msg.type = getContentType(msg.message);

    try {
      // Mentions are part of the message metadata, used for tagging
      msg.mentions = msg.message[msg.type]?.contextInfo?.mentionedJid || [];
    } catch {
      msg.mentions = false; // Default to false if no mentions are found
    }

    try {
      const quoted = msg.message[msg.type]?.contextInfo?.quotedMessage;
      if (quoted) {
        // Handle quoted messages (reply to a previous message)
        let quotedSender =
          msg.message[msg.type]?.contextInfo?.participant ||
          msg.message[msg.type]?.contextInfo?.remoteJid ||
          msg.from;
        let quotedType;

        if (quoted['viewOnceMessageV2']) {
          // Special case for 'view once' messages (messages that disappear after being viewed)
          const quotedViewOnce = quoted.viewOnceMessageV2.message;
          const quotedViewOnceType = Object.keys(quotedViewOnce)[0];

          msg.quoted = {
            type: 'viewOnce',
            stanzaId: msg.message[msg.type]?.contextInfo?.stanzaId,
            sender: quotedSender,
            message: quotedViewOnce,
            body:
              quotedViewOnce[quotedViewOnceType]?.text ||
              quotedViewOnce[quotedViewOnceType]?.caption ||
              quotedViewOnce[quotedViewOnceType]?.description ||
              '',
          };

          // Handle different content types of a 'view once' message
          if (quotedViewOnceType === 'imageMessage') {
            msg.quoted.imageUrl = quotedViewOnce.imageMessage.url;
            msg.quoted.imageCaption = quotedViewOnce.imageMessage.caption;
          } else if (quotedViewOnceType === 'videoMessage') {
            msg.quoted.videoUrl = quotedViewOnce.videoMessage.url;
            msg.quoted.videoCaption = quotedViewOnce.videoMessage.caption;
          } else if (quotedViewOnceType === 'audioMessage') {
            msg.quoted.audioUrl = quotedViewOnce.audioMessage.url;
            msg.quoted.audioDuration = quotedViewOnce.audioMessage.duration;
          } else if (quotedViewOnceType === 'documentMessage') {
            msg.quoted.documentUrl = quotedViewOnce.documentMessage.url;
            msg.quoted.documentTitle = quotedViewOnce.documentMessage.title;
          }
        } else {
          // Handle normal quoted messages (replies to non-view once messages)
          quotedType = Object.keys(quoted)[0];

          msg.quoted = {
            type: 'normal',
            stanzaId: msg.message[msg.type]?.contextInfo?.stanzaId,
            sender: quotedSender,
            message: quoted,
            body:
              quoted[quotedType]?.text ||
              quoted[quotedType]?.caption ||
              quoted[quotedType]?.description ||
              '',
          };

          // Handle different content types of a normal quoted message
          if (quotedType === 'imageMessage') {
            msg.quoted.imageUrl = quoted.imageMessage.url;
            msg.quoted.imageCaption = quoted.imageMessage.caption;
          } else if (quotedType === 'videoMessage') {
            msg.quoted.videoUrl = quoted.videoMessage.url;
            msg.quoted.videoCaption = quoted.videoMessage.caption;
          } else if (quotedType === 'audioMessage') {
            msg.quoted.audioUrl = quoted.audioMessage.url;
            msg.quoted.audioDuration = quoted.audioMessage.duration;
          } else if (quotedType === 'documentMessage') {
            msg.quoted.documentUrl = quoted.documentMessage.url;
            msg.quoted.documentTitle = quoted.documentMessage.title;
          }
        }
        msg.quoted.isSelf = msg.quoted.sender === conn.user.id; // Check if the quoted message is from the bot
        msg.quoted.mtype = quotedType; // Save the type of the quoted message (e.g., image, video, etc.)
        msg.quoted.text = msg.quoted.body; // Store the quoted message text
        msg.quoted.key = {
          remoteJid: msg.from,
          fromMe: msg.quoted.isSelf,
          id: msg.quoted.stanzaId,
          participant: msg.quoted.sender,
        };
      }
    } catch {
      msg.quoted = null; // Default to null if no quoted message is found
    }

    // Handle 'ephemeral' (disappearing) messages
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
      // Default message body for non-ephemeral and non-quoted messages
      msg.body =
        msg.body ||
        msg.message.conversation ||
        msg.message[msg.type]?.text ||
        msg.message[msg.type]?.caption ||
        msg.message[msg.type]?.description ||
        false;
    }
  }

  /**
   * Sends a reply to the current message.
   * @param {string} message - The message to send as a reply.
   * @param {Object} [opts={}] - Optional options for the reply message.
   * @returns {Promise<Object>} - The serialized reply message object.
   */
  msg.reply = async (message, opts = {}) => {
    // Send the reply message and serialize the response
    const content = await conn.sendMessage(
      msg.from,
      { text: message.toString(), ...opts },
      { quoted: opts.quoted }
    );
    return serialize(content, conn); // Recursively serialize the reply message
  };

  await saveMessage(msg, msg.pushName); // Save the message to the database
  return msg; // Return the serialized message object
}
