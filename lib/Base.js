import { detectType, getBuffer } from 'utils';
import { getContentType, generateForwardMessageContent, generateWAMessageFromContent, downloadMediaMessage, jidNormalizedUser } from 'baileys';
import config from '../config.js';
import { numtoId } from './utils.js';

class Message {
	constructor(client, data) {
		Object.defineProperties(this, {
			client: { value: client, writable: true, configurable: true },
			data: { value: data, writable: true, configurable: true },
		});
		if (data) this._events(data);
	}

	_events(data) {
		const { key, isGroup, pushName, participant, messageTimestamp, body, message, quoted, mention, isAdmin, isBotAdmin } = data;
		this.data = data;
		this.key = key;
		this.id = key.id;
		this.jid = key.remoteJid;
		this.isAdmin = isAdmin;
		this.isBotAdmin = isBotAdmin;
		this.isGroup = isGroup;
		this.fromMe = key.fromMe;
		this.pushName = pushName;
		this.message = message;
		this.prefix = config.PREFIX.trim();
		this.sender = jidNormalizedUser(participant);
		this.user = jidNormalizedUser(this.client.user.id);
		this.timestamp = messageTimestamp?.low || messageTimestamp || Date.now();
		this.text = body || '';
		this.bot = /^(BAE5|3EB0)/.test(key.id);
		this.mention = mention;

		this.reply_message = data?.quoted
			? {
					id: quoted.key.id,
					fromMe: quoted.key?.fromMe,
					sender: jidNormalizedUser(quoted.key?.participant || quoted.key?.remoteJid),
					key: quoted.key,
					bot: /^(BAE5|3EB0)/.test(quoted.key.id),
					message: quoted?.message,
					text: quoted.body,
					image: quoted?.type === 'imageMessage',
					video: quoted?.type === 'videoMessage',
					audio: quoted?.type === 'audioMessage',
					sticker: quoted?.type === 'stickerMessage',
					document: quoted?.type === 'documentMessage',
					viewonce: quoted?.viewonce,
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

	async react(emoji, opts = {}) {
		const msg = await this.client.sendMessage(this.jid, { react: { text: emoji, key: opts.key || this.key } });
		return new Message(this.client, msg);
	}

	async delete() {
		const msg = await this.client.sendMessage(this.jid, { delete: this.reply_message?.key });
		return new Message(this.client, msg);
	}

	async clearChat() {
		const msg = await this.client.chatModify(
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
		return new Message(this.client, msg);
	}

	async archiveChat(opts = true) {
		const lstMsg = {
			message: this.message,
			key: this.key,
			messageTimestamp: this.timestamp,
		};
		const msg = await this.client.chatModify(
			{
				archive: opts,
				lastMessages: [lstMsg],
			},
			this.jid,
		);
		return new Message(this.client, msg);
	}

	async updateName(name) {
		return await this.client.updateProfileName(this.user, name);
	}

	async updatePP(imageBuffer) {
		return await this.client.updateProfilePicture(this.user, imageBuffer);
	}

	async rPP() {
		return await this.client.removeProfilePicture(this.user);
	}

	async Block(jid) {
		this.send(`_@${jid.split('@')[0]} Blocked_`, { mentions: [jid] });
		return await this.client.updateBlockStatus(jid, 'block');
	}

	async Unblock(jid) {
		this.send(`_@${jid.split('@')[0]} Unblocked_`, { mentions: [jid] });
		return await this.client.updateBlockStatus(jid, 'unblock');
	}

	async thatJid(match) {
		let jid;
		if (!match && !this.isGroup) {
			jid = this.data.key.remoteJid || this.reply_message?.sender;
		} else if (!match && this.isGroup) {
			jid = this.reply_message?.sender || this.mention[0];
		} else {
			jid = jidNormalizedUser(numtoId(match));
		}
		if (!jid) return this.send('```Reply Or Tag User```');
		return jid;
	}

	async thatProfilePic(jid) {
		const picture = await this.client.profilePictureUrl(jid, 'image');
		const buffer = await getBuffer(picture);
		return buffer || '_No Profile Photo_';
	}

	async send(content, opts = {}) {
		const jid = opts.jid || this.jid;
		const quoted = this.data.quoted || this.data;
		const type = opts.type || (await detectType(content));
		const mentions = opts.mentions || [];
		const contextInfo = opts.contextInfo || {};
		const message = {
			...(type === 'text'
				? { text: content.toString() }
				: type === 'image'
				? { image: Buffer.isBuffer(content) ? content : { url: content } }
				: type === 'video'
				? { video: Buffer.isBuffer(content) ? content : { url: content } }
				: type === 'audio'
				? { audio: Buffer.isBuffer(content) ? content : { url: content }, mimetype: 'audio/mpeg' }
				: type === 'document'
				? { document: Buffer.isBuffer(content) ? content : { url: content } }
				: type === 'sticker'
				? { sticker: Buffer.isBuffer(content) ? content : { url: content } }
				: (() => {
						throw new Error('Unsupported message type');
				  })()),
			mentions,
			contextInfo: {
				...contextInfo,
				mentionedJid: mentions,
			},
			...(opts.caption && ['image', 'video'].includes(type) ? { caption: opts.caption } : {}),
			...(type === 'document' ? { fileName: opts.fileName } : {}),
			...opts,
		};
		const msg = await this.client.sendMessage(jid, message, {
			quoted,
			...(opts.messageOptions || {}),
		});

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

		const forwardContent = generateForwardMessageContent(content, options.force);
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
		const buffer = await downloadMediaMessage(
			{
				key: this.data.quoted.key,
				message: this.data?.quoted?.message,
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
