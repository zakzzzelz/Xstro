import { downloadContentFromMessage, getContentType, generateForwardMessageContent, generateWAMessageFromContent } from 'baileys';
import { decodeJid, parsedJid, ensureBuffer, detectMimeType } from '../utils/utils.js';
import { PREFIX } from '../../config.js';

class Message {
	constructor(client, data) {
		this.client = client;
		if (data) this._patch(data);
	}

	_patch(data) {
		const { key, isGroup, pushName, sender, messageTimestamp, body, type, message, quoted } = data;
		this.bot = this.client;
		this.data = data;
		this.key = key;
		this.id = key.id;
		this.jid = key.remoteJid;
		this.isGroup = isGroup;
		this.fromMe = key.fromMe;
		this.pushName = pushName;
		this.message = message;
		this.prefix = PREFIX;
		this.sender = parsedJid(sender)?.[0];
		this.user = decodeJid(this.client.user.id);
		this.timestamp = typeof messageTimestamp === 'object' ? messageTimestamp.low : messageTimestamp;
		this.text = body || '';
		this.type = type ? type.replace('Message', '').toLowerCase() : 'baileysEmit';

		if (type) this[this.type] = message[type];
		this.mention = message?.extendedTextMessage?.contextInfo?.mentionedJid || false;

		if (quoted) {
			const contextInfo = quoted?.extendedTextMessage?.contextInfo || {};
			this.reply_message = contextInfo.quotedMessage
				? {
						message: contextInfo.quotedMessage,
						sender: parsedJid(contextInfo.participant)?.[0],
						image: Boolean(contextInfo.quotedMessage.imageMessage),
						video: Boolean(contextInfo.quotedMessage.videoMessage),
						audio: Boolean(contextInfo.quotedMessage.audioMessage),
						document: Boolean(contextInfo.quotedMessage.documentMessage),
						mentionJid: contextInfo.mentionedJid || [],
				  }
				: false;
		}

		this.quoted = quoted
			? {
					data: quoted,
					message: quoted.message,
					sender: parsedJid(quoted.sender)?.[0],
					key: quoted.key,
					pushName: quoted.pushName,
					viewonce: this._isViewOnce(quoted.message),
					ephemeral: Boolean(quoted.message?.ephemeralMessage),
			  }
			: false;
	}

	_isViewOnce(message) {
		return message.audioMessage?.viewOnce || message.imageMessage?.viewOnce || message.videoMessage?.viewOnce || message.viewOnce || message.viewOnceMessageV2 || message.viewOnceMessageV2Extension || false;
	}

	async edit(content) {
		const msg = await this.client.sendMessage(this.jid, {
			text: content,
			edit: this.key,
		});
		return new Message(this.client, msg);
	}

	async sendReply(content, options = {}) {
		const messageContent = typeof content === 'string' ? { text: content } : content;
		const response = await this.client.sendMessage(this.jid, { ...messageContent, ...options }, { quoted: this.data });
		return new Message(this.client, response);
	}

	async react(emoji) {
		const msg = await this.client.sendMessage(this.jid, { react: { text: emoji, key: this.key } });
		return new Message(this.client, msg);
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
		let mediaType;

		if (msg.imageMessage) mediaType = 'imageMessage';
		else if (msg.videoMessage) mediaType = 'videoMessage';
		else if (msg.stickerMessage) mediaType = 'stickerMessage';
		else if (msg.documentMessage) mediaType = 'documentMessage';
		else if (msg.audioMessage) mediaType = 'audioMessage';

		const stream = await downloadContentFromMessage(msg[mediaType], mediaType.replace('Message', ''));
		const chunks = [];
		for await (const chunk of stream) chunks.push(chunk);
		return Buffer.concat(chunks);
	}

	async saveNForward(jid, content, opts = {}) {
		if (!this.quoted) throw new Error('No Quoted Message found!');
		await this.client.sendMessage(jid, { forward: content, contextInfo: { forwardingScore: 1, isForwarded: true }, ...opts }, { quoted: this.quoted });
	}

	async send(content, options = {}) {
		const jid = options.jid || this.jid;
		const quoted = options.quoted || this.data;
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
			mimeType = await detectMimeType(buffer);
		} else if (typeof content === 'string' && content.startsWith('http')) {
			buffer = await ensureBuffer(content);
			mimeType = await detectMimeType(buffer);
		} else {
			buffer = Buffer.from(content);
			mimeType = 'text/plain';
		}

		const contentType = options.type || mimeType.split('/')[0];
		if (contentType === 'text') return sendMessage('text', buffer.toString(), sendOptions);
		else if (contentType === 'image') return sendMessage('image', buffer, sendOptions);
		else if (contentType === 'video') return sendMessage('video', buffer, sendOptions);
		else if (contentType === 'audio') return sendMessage('audio', buffer, { mimetype: 'audio/mp4', ...sendOptions });
		else if (contentType === 'document') return sendMessage('document', buffer, { mimetype: options.mimetype || 'application/octet-stream', fileName: options.filename || 'file', ...sendOptions });
		else return sendMessage('document', buffer, { ...sendOptions, mimetype: mimeType });
	}
}

export default Message;
