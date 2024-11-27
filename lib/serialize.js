import { getContentType, getDevice } from 'baileys';
import { saveMessage } from './sql/store.js';
import { getGroupMetadata, numtoId } from './utils.js';

export async function serialize(msg, conn) {
	if (!msg || !conn) return;
	if (msg.key) {
		msg.id = msg.key.id;
		msg.isSelf = msg.key.fromMe;
		msg.from = msg.key.remoteJid;
		msg.isGroup = msg.from.endsWith('@g.us');
		msg.sender = msg.isGroup ? msg.key.participant : msg.isSelf ? conn.user.id : msg.from;
		msg.device = getDevice(msg.key.id);
	}

	if (msg.isGroup) {
		const groupMetadata = await getGroupMetadata(conn, msg.from);
		const owner = numtoId(conn.user.id.split(':')[0]);
		const user = numtoId(msg.sender);
		if (groupMetadata) {
			const participants = groupMetadata.participants || [];
			msg.isAdmin = participants.some(p => p.id === user && (p.admin === 'admin' || p.admin === 'superadmin'));
			msg.isBotAdmin = participants.some(p => p.id === owner && (p.admin === 'admin' || p.admin === 'superadmin'));
		} else {
			msg.isAdmin = false;
			msg.isBotAdmin = false;
		}
	} else {
		msg.isAdmin = false;
		msg.isBotAdmin = false;
	}

	if (msg.message) {
		msg.type = getContentType(msg.message);

		try {
			msg.mentions = msg.message[msg.type]?.contextInfo?.mentionedJid || [];
		} catch {
			msg.mentions = false;
		}
		try {
			const quoted = msg.message[msg.type]?.contextInfo?.quotedMessage;
			if (quoted) {
				let quotedSender = msg.message[msg.type]?.contextInfo?.participant || msg.message[msg.type]?.contextInfo?.remoteJid || msg.from;
				let quotedType;

				if (quoted['viewOnceMessageV2']) {
					const quotedViewOnce = quoted.viewOnceMessageV2.message;
					const quotedViewOnceType = Object.keys(quotedViewOnce)[0];

					msg.quoted = {
						type: 'viewOnce',
						stanzaId: msg.message[msg.type]?.contextInfo?.stanzaId,
						sender: quotedSender,
						message: quotedViewOnce,
						body: quotedViewOnce[quotedViewOnceType]?.text ||
							quotedViewOnce[quotedViewOnceType]?.caption ||
							quotedViewOnce[quotedViewOnceType]?.description || ''
					};

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
					quotedType = Object.keys(quoted)[0];

					msg.quoted = {
						type: 'normal',
						stanzaId: msg.message[msg.type]?.contextInfo?.stanzaId,
						sender: quotedSender,
						message: quoted,
						body: quoted[quotedType]?.text ||
							quoted[quotedType]?.caption ||
							quoted[quotedType]?.description || ''
					};

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
				msg.quoted.isSelf = msg.quoted.sender === conn.user.id;
				msg.quoted.mtype = quotedType;
				msg.quoted.text = msg.quoted.body;
				msg.quoted.key = {
					remoteJid: msg.from,
					fromMe: msg.quoted.isSelf,
					id: msg.quoted.stanzaId,
					participant: msg.quoted.sender,
				};
			}
		} catch {
			msg.quoted = null;
		}

		if (msg.message['ephemeralMessage']) {
			const ephemeralType = Object.keys(msg.message.ephemeralMessage.message)[0];
			msg.body = msg.body || msg.message.ephemeralMessage.message[ephemeralType]?.text ||
				msg.message.ephemeralMessage.message[ephemeralType]?.caption ||
				msg.message.ephemeralMessage.message[ephemeralType]?.description || '';

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
			msg.body = msg.body || msg.message.conversation ||
				msg.message[msg.type]?.text ||
				msg.message[msg.type]?.caption ||
				msg.message[msg.type]?.description || false;
		}
	}
	msg.reply = async (message, opts = {}) => {
		const content = await conn.sendMessage(msg.from, { text: message.toString(), ...opts }, { quoted: opts.quoted });
		return serialize(content, conn);
	};
	await saveMessage(msg, msg.pushName);
	return msg;
}