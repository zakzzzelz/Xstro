import { XUtils } from 'utils';
import { getContentType, generateForwardMessageContent, generateWAMessageFromContent, downloadMediaMessage } from 'baileys';
import { decodeJid, parsedJid } from './utils.js';
import config from '../config.js';
import { Utils } from 'sequelize';

class Message {
	constructor(client, data) {
		Object.defineProperty(this, 'client', {
			value: client,
			enumerable: false,
			writable: true,
			configurable: true,
		});
		Object.defineProperty(this, 'data', {
			value: data,
			enumerable: false,
			writable: true,
			configurable: true,
		});
		if (data) this._events(data);
	}

	_events(data) {
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
		this.timestamp = messageTimestamp?.low || messageTimestamp || Date.now();
		this.text = body || '';
		this.bot = /^(BAE5|3EB0)/.test(key.id);
		this.mention = message?.extendedTextMessage?.contextInfo?.mentionedJid || false;

		this.reply_message = data?.quoted
			? {
					id: quoted.key.id,
					fromMe: quoted.isSelf,
					sender: parsedJid(quoted.sender)?.[0],
					key: quoted.key,
					pushName: quoted.pushName,
					bot: /^(BAE5|3EB0)/.test(quoted.key.id),
					text: quoted.message?.imageMessage?.caption || quoted.message?.videoMessage?.caption || quoted.message?.conversation || quoted.message?.extendedTextMessage?.text || false,
					image: Boolean(quoted.message.imageMessage),
					video: Boolean(quoted.message.videoMessage),
					audio: Boolean(quoted.message.audioMessage),
					sticker: Boolean(quoted.message.stickerMessage),
					document: Boolean(quoted.message.documentMessage),
					viewonce: quoted.message.audioMessage?.viewOnce || quoted.message.imageMessage?.viewOnce || quoted.message.videoMessage?.viewOnce || quoted.message.viewOnce || quoted.message.viewOnceMessageV2 || quoted.message.viewOnceMessageV2Extension || false,
					ephemeral: Boolean(quoted.message?.ephemeralMessage),
			  }
			: false;
	}

	async edit(content) {
		const msg = await this.client.sendMessage(this.jid, {
			text: content,
			edit: this.reply_message?.key || this.key,
		});
		return new Message(this.client, msg);
	}

	async sendReply(content, options = {}) {
		const messageContent = typeof content === 'string' ? { text: content } : content;
		const response = await this.client.sendMessage(this.jid, { ...messageContent, ...options }, { quoted: this.data });
		return new Message(this.client, response);
	}

	async react(emoji, opts = {}) {
		const msg = await this.client.sendMessage(opts.jid || this.jid, { react: { text: emoji, key: opts.key || this.key } });
		return new Message(this.client, msg);
	}

	async delete() {
		const msg = await this.client.sendMessage(this.jid, { delete: this.reply_message?.key });
		return new Message(this.client, msg);
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
			this.jid,
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
			this.jid,
		);
	}

	async send(content, opts = {}) {
		const jid = opts.jid || this.jid;
		const quoted = opts.quoted || this.quoted;
		const type = opts.type || (await XUtils.detectType(content));
		console.log(type);
		let message = {};
		switch (type) {
			case 'text':
				message = { text: content };
				break;
			case 'image':
				message = { image: Buffer.isBuffer(content) ? content : { url: content }, caption: opts.caption };
				break;
			case 'video':
				message = { video: Buffer.isBuffer(content) ? content : { url: content }, caption: opts.caption };
				break;
			case 'audio':
				message = { audio: Buffer.isBuffer(content) ? content : { url: content }, mimetype: 'audio/mpeg' };
				break;
			case 'document':
				message = { document: Buffer.isBuffer(content) ? content : { url: content }, fileName: opts.fileName };
				break;
			case 'sticker':
				message = { sticker: Buffer.isBuffer(content) ? content : { url: content } };
				break;
			default:
				throw new Error('Unsupported message type');
		}

		await this.client.sendMessage(jid, message, { quoted: quoted });
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

	async downloadAndSaveMedia() {
		const buffer = await downloadMediaMessage(
			{
				key: this.data.quoted.key || this.key,
				message: this.data.quoted.message || this.message,
			},
			'buffer',
			{},
			{
				logger: console,
				reuploadRequest: this.client.updateMediaMessage,
			},
		);
		return buffer;
	}
}

export default Message;
