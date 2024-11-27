export async function serialize(msg, conn) {
  if (!msg || !conn) return;

  // Avoid circular structure by removing or deep cloning the message object
  const msgs = JSON.parse(JSON.stringify(msg)); // Deep clone to avoid circular references

  if (msgs.key) {
    // Basic Messages Data
    msgs.message = msgs;
    msgs.id = msgs.key.id;
    msgs.isSelf = msgs.key.fromMe;
    msgs.from = msgs.key.remoteJid;
    msgs.isGroup = msgs.from.endsWith('@g.us'); // Identifying if the message is from a group
    msgs.sender = msgs.isGroup ? msgs.key.participant : msgs.isSelf ? conn.user.id : msgs.from;
    msgs.device = getDevice(msgs.key.id); // Identifies the device from which the message was sent
  }

  if (msgs.isGroup) {
    // If the message is from a group, fetch group metadata
    const groupMetadata = await getGroupMetadata(conn, msgs.from);
    const owner = numtoId(conn.user.id.split(':')[0]); // Get the owner's ID for admin check
    const user = numtoId(msgs.sender); // Get the user ID for checking admin status
    if (groupMetadata) {
      // Check if the user is an admin in the group
      const participants = groupMetadata.participants || [];
      msgs.isAdmin = participants.some(
        (p) => p.id === user && (p.admin === 'admin' || p.admin === 'superadmin')
      );
      // Check if the bot itself is an admin
      msgs.isBotAdmin = participants.some(
        (p) => p.id === owner && (p.admin === 'admin' || p.admin === 'superadmin')
      );
    } else {
      msgs.isAdmin = false;
      msgs.isBotAdmin = false; // Default to no admin rights if no group metadata is available
    }
  } else {
    // If the message is not from a group, default admin checks to false
    msgs.isAdmin = false;
    msgs.isBotAdmin = false;
  }

  if (msgs.message) {
    // Get the content type of the message (e.g., text, image, video, etc.)
    msgs.type = getContentType(msgs.message);

    try {
      // Mentions are part of the message metadata, used for tagging
      msgs.mentions = msgs.message[msgs.type]?.contextInfo?.mentionedJid || [];
    } catch {
      msgs.mentions = false; // Default to false if no mentions are found
    }

    try {
      const quoted = msgs.message[msgs.type]?.contextInfo?.quotedMessage;
      if (quoted) {
        let quotedSender =
          msgs.message[msgs.type]?.contextInfo?.participant ||
          msgs.message[msgs.type]?.contextInfo?.remoteJid ||
          msgs.from;
        let quotedType;

        if (quoted['viewOnceMessageV2']) {
          const quotedViewOnce = quoted.viewOnceMessageV2.message;
          const quotedViewOnceType = Object.keys(quotedViewOnce)[0];

          msgs.quoted = {
            type: 'viewOnce',
            stanzaId: msgs.message[msgs.type]?.contextInfo?.stanzaId,
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

          msgs.quoted = {
            type: 'normal',
            stanzaId: msgs.message[msgs.type]?.contextInfo?.stanzaId,
            sender: quotedSender,
            message: quoted,
            body:
              quoted[quotedType]?.text ||
              quoted[quotedType]?.caption ||
              quoted[quotedType]?.description ||
              '',
          };
        }
        msgs.quoted.isSelf = msgs.quoted.sender === conn.user.id;
        msgs.quoted.mtype = quotedType;
        msgs.quoted.text = msgs.quoted.body;
        msgs.quoted.key = {
          remoteJid: msgs.from,
          fromMe: msgs.quoted.isSelf,
          id: msgs.quoted.stanzaId,
          participant: msgs.quoted.sender,
        };
      }
    } catch {
      msgs.quoted = null;
    }

    if (msgs.message['ephemeralMessage']) {
      const ephemeralType = Object.keys(msgs.message.ephemeralMessage.message)[0];
      msgs.body =
        msgs.body ||
        msgs.message.ephemeralMessage.message[ephemeralType]?.text ||
        msgs.message.ephemeralMessage.message[ephemeralType]?.caption ||
        msgs.message.ephemeralMessage.message[ephemeralType]?.description ||
        '';

      msgs.quoted = {
        type: 'ephemeral',
        stanzaId: msgs.key.id,
        sender: msgs.sender,
        message: msgs.message.ephemeralMessage.message[ephemeralType],
        key: {
          remoteJid: msgs.from,
          fromMe: msgs.isSelf,
          id: msgs.key.id,
          participant: msgs.sender,
        },
      };
    } else {
      msgs.body =
        msgs.body ||
        msgs.message.conversation ||
        msgs.message[msgs.type]?.text ||
        msgs.message[msgs.type]?.caption ||
        msgs.message[msgs.type]?.description ||
        false;
    }
  }

  msg.reply = async (message, opts = {}) => {
    const content = await conn.sendMessage(
      msgs.from,
      { text: message.toString(), ...opts },
      { quoted: opts.quoted }
    );
    return serialize(content, conn);
  };

  await saveMessage(msgs, msgs.pushName); // Save the deep-cloned message to the database
  return msgs; // Return the deep-cloned message object
}
