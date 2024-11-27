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
    // Basic Messages Data
    msg.id = msg.key.id;
    msg.isSelf = msg.key.fromMe;
    msg.from = msg.key.remoteJid;
    msg.isGroup = msg.from.endsWith('@g.us'); // Identifying if the message is from a group
    msg.sender = msg.isGroup ? msg.key.participant : msg.isSelf ? conn.user.id : msg.from;
    msg.device = getDevice(msg.key.id); // Identifies the device from which the message was sent
    msg.message = msg.message;
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
      const contextInfo = msg.message[msg.type]?.contextInfo;
      const quoted = contextInfo?.quotedMessage;

      if (quoted) {
        // Quoted message handling
        let quotedSender = contextInfo?.participant || contextInfo?.remoteJid || msg.from;

        // Get the full original message object
        const originalMessage = quoted;

        msg.quoted = {
          // Include the FULL original message object
          originalMessage: originalMessage,

          // Existing metadata
          type: 'normal',
          stanzaId: contextInfo?.stanzaId,
          sender: quotedSender,
          message: originalMessage, // Duplicate for backwards compatibility
          body:
            originalMessage?.extendedTextMessage?.text ||
            originalMessage?.conversation ||
            originalMessage?.imageMessage?.caption ||
            originalMessage?.videoMessage?.caption ||
            '',
        };

        // Additional type-specific handling
        const quotedType = Object.keys(originalMessage)[0];
        msg.quoted.mtype = quotedType;

        // Extract specific details based on message type
        switch (quotedType) {
          case 'imageMessage':
            msg.quoted.imageUrl = originalMessage.imageMessage.url;
            msg.quoted.imageCaption = originalMessage.imageMessage.caption;
            break;
          case 'videoMessage':
            msg.quoted.videoUrl = originalMessage.videoMessage.url;
            msg.quoted.videoCaption = originalMessage.videoMessage.caption;
            break;
          case 'audioMessage':
            msg.quoted.audioUrl = originalMessage.audioMessage.url;
            msg.quoted.audioDuration = originalMessage.audioMessage.duration;
            break;
          case 'documentMessage':
            msg.quoted.documentUrl = originalMessage.documentMessage.url;
            msg.quoted.documentTitle = originalMessage.documentMessage.title;
            break;
        }

        // Other existing metadata
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
