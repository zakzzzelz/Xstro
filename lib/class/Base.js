import {
  getContentType,
  generateForwardMessageContent,
  generateWAMessageFromContent,
  downloadMediaMessage,
} from 'baileys';
import { decodeJid, parsedJid, getMimeType } from '../utils.js';
import config from '../../config.js';

class Message {
  constructor(client, data) {
    Object.defineProperty(this, 'client', {
      value: client,
      enumerable: false,
      writable: true,
      configurable: true,
    });

    Object.defineProperty(this, 'bot', {
      value: client,
      enumerable: false,
      writable: true,
      configurable: true,
    });

    if (data) this._patch(data);
  }

  _patch(data) {
    const { key, isGroup, pushName, sender, messageTimestamp, body, message, quoted } = data;
    this.data = data;
    this.key = key;
    this.id = key.id;
    this.jid = key.remoteJid;
    this.isGroup = isGroup;
    this.fromMe = key.fromMe;
    this.pushName = pushName;
    this.message = message;
    this.prefix = config.PREFIX.trim();
    this.sender = parsedJid(sender)?.[0];
    this.user = decodeJid(this.client.user.id);
    this.timestamp = messageTimestamp?.low || messageTimestamp;
    this.text = body || '';
    this.bot = /^(BAE5|3EB0)/.test(key.id);

    this.mention = message?.extendedTextMessage?.contextInfo?.mentionedJid || false;
    this.quoted = quoted;

    this.reply_message = quoted
      ? {
          id: quoted.key.id,
          fromMe: quoted.isSelf,
          sender: parsedJid(quoted.sender)?.[0],
          key: quoted.key,
          pushName: quoted.pushName,
          bot: /^(BAE5|3EB0)/.test(quoted.key.id),
          text:
            quoted.message?.imageMessage?.caption ||
            quoted.message?.videoMessage?.caption ||
            quoted.message?.conversation ||
            quoted.message?.extendedTextMessage?.text ||
            false,
          image: Boolean(quoted.message.imageMessage),
          video: Boolean(quoted.message.videoMessage),
          audio: Boolean(quoted.message.audioMessage),
          sticker: Boolean(quoted.message.stickerMessage),
          document: Boolean(quoted.message.documentMessage),
          viewonce:
            quoted.message.audioMessage?.viewOnce ||
            quoted.message.imageMessage?.viewOnce ||
            quoted.message.videoMessage?.viewOnce ||
            quoted.message.viewOnce ||
            quoted.message.viewOnceMessageV2 ||
            quoted.message.viewOnceMessageV2Extension ||
            false,
          ephemeral: Boolean(quoted.message?.ephemeralMessage),
        }
      : false;
  }

  async edit(content) {
    const msg = await this.client.sendMessage(this.jid, {
      text: content,
      edit: this.reply_message.key || this.key,
    });
    return new Message(this.client, msg);
  }

  async sendReply(content, options = {}) {
    const messageContent = typeof content === 'string' ? { text: content } : content;
    const response = await this.client.sendMessage(
      this.jid,
      { ...messageContent, ...options },
      { quoted: this.data }
    );
    return new Message(this.client, response);
  }

  async react(emoji) {
    const msg = await this.client.sendMessage(this.jid, { react: { text: emoji, key: this.key } });
    return new Message(this.client, msg);
  }

  async delete() {
    const msg = await this.client.sendMessage(this.jid, { delete: this.quoted.key });
    return new Message(this.client, msg);
  }

  async copyNForward(jid, content, opts = {}) {
    if (!this.quoted) throw new Error('No Quoted Message found!');
    await this.client.sendMessage(
      jid,
      { forward: content, contextInfo: { forwardingScore: 0, isForwarded: false }, ...opts },
      { quoted: this.quoted }
    );
  }

  async clearChat() {
    await this.client.chatModify(
      {
        delete: true,
        lastMessages: [
          {
            key: this.key,
            messageTimestamp: this.timestamp,
          },
        ],
      },
      this.jid
    );
  }

  async archiveChat(opts = true) {
    const lstMsg = {
      message: this.message,
      key: this.key,
      messageTimestamp: this.timestamp,
    };
    await this.client.chatModify(
      {
        archive: opts,
        lastMessages: [lstMsg],
      },
      this.jid
    );
  }

  async forward(jid, content, options = {}) {
    if (options.readViewOnce) {
      content = content?.ephemeralMessage?.message || content;
      const viewOnceKey = Object.keys(content)[0];
      delete content?.ignore;
      delete content?.viewOnceMessage?.message?.[viewOnceKey]?.viewOnce;
      content = { ...content?.viewOnceMessage?.message };
    }

    const forwardContent = generateForwardMessageContent(content, !!options.force);
    const contentType = getContentType(forwardContent);

    const forwardOptions = {
      ...options,
      contextInfo: {
        ...(options.contextInfo || {}),
        ...(options.mentions ? { mentionedJid: options.mentions } : {}),
        ...forwardContent[contentType]?.contextInfo,
      },
    };

    const waMessage = generateWAMessageFromContent(jid, forwardContent, forwardOptions);
    return this.client.relayMessage(jid, waMessage.message, {
      messageId: waMessage.key.id,
    });
  }

  async download() {
    const msg = this.quoted.message;
    const mediaType = Object.keys(msg).find((key) => key.endsWith('Message'));
    if (!mediaType) throw new Error('Unsupported message type');
    const media = await downloadMediaMessage(msg[mediaType], 'buffer');
    return media;
  }

  async send(content, options = {}) {
    const jid = options.jid || this.jid;
    const quoted = options.quoted === false ? undefined : options.quoted || this.data;
    const sendOptions = {
      caption: options.caption,
      contextInfo: options.contextInfo,
      ...options,
    };
    const sendMessage = async (type, buffer, opts) => {
      const messageOptions = { [type]: buffer, ...opts };
      return this.client.sendMessage(jid, messageOptions, { quoted });
    };

    let buffer;
    let mimeType;

    if (Buffer.isBuffer(content)) {
      buffer = content;
      mimeType = await getMimeType(buffer);
    } else {
      buffer = Buffer.from(content);
      mimeType = 'text/plain';
    }

    const contentType = options.type || mimeType.split('/')[0];
    if (contentType === 'sticker') return sendMessage('sticker', buffer, sendOptions);
    if (contentType === 'text') return sendMessage('text', buffer.toString(), sendOptions);
    else if (contentType === 'image') return sendMessage('image', buffer, sendOptions);
    else if (contentType === 'video') return sendMessage('video', buffer, sendOptions);
    else if (contentType === 'audio')
      return sendMessage('audio', buffer, { mimetype: 'audio/mp4', ...sendOptions });
    else if (contentType === 'document')
      return sendMessage('document', buffer, {
        mimetype: options.mimetype || 'application/octet-stream',
        fileName: options.filename || 'file',
        ...sendOptions,
      });
    else return sendMessage('document', buffer, { ...sendOptions, mimetype: mimeType });
  }
}

export default Message;
