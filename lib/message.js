import { downloadContentFromMessage, getContentType, generateForwardMessageContent, generateWAMessageFromContent } from "baileys";
import { decodeJid, parsedJid, createInteractiveMessage } from "./utils.js";

class Message {
	#client;
	#mediaTypes = {
		image: "imageMessage",
		video: "videoMessage",
		sticker: "stickerMessage",
		document: "documentMessage",
		audio: "audioMessage",
		location: "locationMessage",
		contact: "contactMessage",
		product: "productMessage",
	};

	constructor(client, data) {
		this.#client = client;
		if (data) this._patch(data);
	}

	get client() {
		return this.#client;
	}

	_patch(data) {
		const { key, isGroup, pushName, sender, messageTimestamp, body, type, message, quoted } = data;

		Object.assign(this, {
			data,
			key,
			id: key.id,
			jid: key.remoteJid,
			isGroup,
			fromMe: key.fromMe,
			pushName,
			participant: parsedJid(sender)?.[0],
			user: decodeJid(this.#client.user.id),
			timestamp: typeof messageTimestamp === "object" ? messageTimestamp.low : messageTimestamp,
			text: body || "",
			type: type ? type.replace("Message", "").toLowerCase() : "baileysEmit",
			isViewOnce: Boolean(message?.viewOnceMessage || message?.viewOnceMessageV2),
			isEphemeral: Boolean(message?.ephemeralMessage),
			hasQuotedMessage: Boolean(message?.extendedTextMessage?.contextInfo?.quotedMessage),
			hasMentions: Boolean(message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0),
		});

		if (type) this[this.type] = message[type];
		this.mention = message?.extendedTextMessage?.contextInfo?.mentionedJid || false;
		this.quoted = quoted ? this._createQuotedObject(quoted) : false;
		this.reply_message = this._processReplyMessage(message);

		return this;
	}

	_createQuotedObject(quoted) {
		return {
			data: quoted,
			message: quoted.message,
			sender: parsedJid(quoted.sender)?.[0],
			key: quoted.key,
			pushName: quoted.pushName,
			mentionedJids: quoted.message?.extendedTextMessage?.contextInfo?.mentionedJid || [],
			viewonce: Boolean(quoted.message?.viewOnceMessage || quoted.message?.viewOnceMessageV2),
			ephemeral: Boolean(quoted.message?.ephemeralMessage),
		};
	}

	_processReplyMessage(message) {
		const contextInfo = message?.extendedTextMessage?.contextInfo;
		if (!contextInfo?.quotedMessage) return null;

		const quotedMessage = contextInfo.quotedMessage;
		return {
			message: quotedMessage,
			sender: parsedJid(contextInfo.participant)?.[0],
			stanzaId: contextInfo.stanzaId,
			image: Boolean(quotedMessage.imageMessage),
			video: Boolean(quotedMessage.videoMessage),
			audio: Boolean(quotedMessage.audioMessage),
			document: Boolean(quotedMessage.documentMessage),
			mentionJid: contextInfo.mentionedJid || [],
			viewonce: Boolean(quotedMessage?.viewOnceMessage || quotedMessage?.viewOnceMessageV2),
			ephemeral: Boolean(quotedMessage?.ephemeralMessage),
		};
	}

	async edit(message) {
		const messageContent = typeof message === "string" ? { text: message } : message;
		return this.#client.sendMessage(this.jid, { ...messageContent, edit: this.key || this.quoted.key });
	}

	async sendReply(content, options = {}) {
		const messageContent = typeof content === "string" ? { text: content } : content;
		return this.#client.sendMessage(this.jid, { ...messageContent, ...options }, { quoted: this.data });
	}

	async sendInteractive(content) {
		const genMessage = createInteractiveMessage(content);
		return this.#client.relayMessage(this.jid, genMessage.message, {
			messageId: genMessage.key.id,
		});
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
		return this.#client.relayMessage(jid, waMessage.message, {
			messageId: waMessage.key.id,
		});
	}

	async download() {
		const msg = this.quoted.message;
		const mediaType = Object.values(this.#mediaTypes).find((type) => msg[type]);
		const stream = await downloadContentFromMessage(msg[mediaType], mediaType.replace("Message", ""));
		const chunks = [];
		for await (const chunk of stream) chunks.push(chunk);
		return Buffer.concat(chunks);
	}

	async saveNForward(jid, content, opts = {}) {
		if (!this.quoted) throw new Error("No Quoted Message found!");
		await this.#client.sendMessage(jid, { forward: content, contextInfo: { forwardingScore: 999, isForwarded: true }, ...opts }, { quoted: this.quoted });
	}
}

export default Message;
