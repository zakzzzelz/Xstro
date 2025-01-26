import fs from 'fs';
import os from 'os';
import path from 'path';
import { detectType, FileTypeFromBuffer, getBuffer, getMimeType } from 'xstro-utils';
import { downloadMediaMessage } from 'baileys';
import { isUrl, toJid } from '#utils';
import { LANG } from '#lang';

class Message {
  constructor(client, data) {
    Object.defineProperties(this, {
      client: { value: client, writable: true, configurable: true },
      data: { value: data, writable: true, configurable: true },
      sendMessage: { value: data?.send, writable: true, configurable: true },
    });
    if (data) this._events(data);
  }

  _events(data) {
    this.data = data;
    this.key = data.key;
    this.id = data.key.id;
    this.jid = data.key.remoteJid;
    this.isAdmin = data.isAdmin;
    this.isBotAdmin = data.isBotAdmin;
    this.isGroup = data.isGroup;
    this.fromMe = data.key.fromMe;
    this.pushName = data.pushName;
    this.message = data.message;
    this.prefix = data.prefix;
    this.sender = data.sender;
    this.mtype = data.type;
    this.user = toJid(this.client.user.id);
    this.timestamp = data.messageTimestamp?.low || data.messageTimestamp || Date.now();
    this.text = data.body || '';
    this.bot = /^(BAE5|3EB0)/.test(data.key.id);
    this.mention = data.mention;
    this.sendMessage = data.send;
    this.quoted = data.quoted;

    if (data.quoted) {
      const quoted = data.quoted;
      this.reply_message = {
        id: quoted.key.id,
        fromMe: quoted.key.fromMe,
        sender: toJid(quoted.key.participant || quoted.key.remoteJid),
        key: quoted.key,
        bot: /^(BAE5|3EB0)/.test(quoted.key.id),
        message: quoted.message,
        text: quoted.body,
        image: quoted.type === 'imageMessage',
        video: quoted.type === 'videoMessage',
        audio: quoted.type === 'audioMessage',
        sticker: quoted.type === 'stickerMessage',
        document: quoted.type === 'documentMessage',
        viewonce: quoted.viewonce,
      };
    } else {
      this.reply_message = null;
    }
  }

  async getAdmin() {
    if (!this.isAdmin) {
      await this.send(LANG.ISADMIN);
      return false;
    }
    if (!this.isBotAdmin) {
      await this.send(LANG.ISBOTADMIN);
      return false;
    }
    return true;
  }

  async getJid(match) {
    return this.isGroup
      ? match
        ? toJid(match)
        : this.reply_message?.sender
          ? this.reply_message.sender
          : this.mention?.[0]
            ? this.mention[0]
            : false
      : match
        ? toJid(match)
        : this.reply_message?.sender
          ? this.reply_message.sender
          : this.remoteJid
            ? this.remoteJid
            : false;
  }

  async edit(content) {
    const msg = await this.client.sendMessage(this.jid, {
      text: content,
      edit: this.reply_message?.key || this.key,
    });
    return new Message(this.client, msg);
  }

  async react(emoji, opts = {}) {
    const msg = await this.client.sendMessage(this.jid, {
      react: { text: emoji, key: opts.key || this.key },
    });
    return new Message(this.client, msg);
  }

  async delete() {
    const msg = await this.client.sendMessage(this.jid, {
      delete: this.reply_message?.key || this.key,
    });
    return new Message(this.client, msg);
  }

  async send(content, opts = {}) {
    const jid = opts.jid || this.jid;
    const type = opts.type || (await detectType(content));
    const mentions = opts.mentions || [];
    const contextInfo = opts.contextInfo || {};
    const msg = await this.client.sendMessage(jid, {
      [type]: content,
      contextInfo: { mentionedJid: mentions, ...contextInfo, ...opts },
      ...opts,
    });
    return new Message(this.client, msg);
  }

  async sendFile(file, fileName, caption, opts = {}) {
    try {
      if (!file) throw new Error('No file provided');
      if (isUrl(file)) file = await getBuffer(file);
      if (!Buffer.isBuffer(file)) throw new Error('File must be a buffer or a valid URL');
      const mime = await getMimeType(file);
      if (!mime) throw new Error('Unable to detect mime type');
      const defaults = {
        document: file,
        mimetype: mime,
        fileName: fileName || 'χѕтяσ м∂',
        caption: caption || '',
        ...opts,
      };
      const data = await this.client.sendMessage(this.jid, defaults, {
        quoted: opts.quoted,
        ...opts,
      });
      return new Message(this.client, data);
    } catch (error) {
      throw new Error(`Error sending file: ${error.message}`);
    }
  }

  async sendFromUrl(url, opts = {}) {
    if (!isUrl(url)) throw new Error('Invalid URL');
    let buffer;
    try {
      buffer = await getBuffer(url);
      const content = await detectType(buffer);
      if (!content) throw new Error('Unsupported content type detected');
      const data = await this.client.sendMessage(
        this.jid,
        { [opts.type || content]: buffer, ...opts },
        { ...opts }
      );
      return new Message(this.client, data);
    } catch (error) {
      throw new Error(`Error sending message: ${error.message}`);
    }
  }

  async forward(jid, message, options = {}) {
    const waMessage = await this.client.sendMessage(
      jid,
      { forward: message, ...options },
      { quoted: this.data }
    );
    return new Message(this.client, waMessage);
  }

  async download(file = false) {
    const buffer = await downloadMediaMessage(
      {
        key: this?.data?.quoted.key,
        message: this?.data?.quoted?.message,
      },
      'buffer',
      {},
      {
        logger: console,
        reuploadRequest: this.client.updateMediaMessage,
      }
    );
    if (file) {
      const ext = await FileTypeFromBuffer(buffer);
      const tmp = path.join(os.tmpdir(), `${Date.now()}.${ext}`);
      await fs.promises.writeFile(tmp, buffer);
      return tmp;
    }
    return buffer;
  }
}

export default Message;
