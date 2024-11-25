import { getContentType, getDevice } from 'baileys';
import { saveMessage } from './sql/store.js';

const messageCache = new Map();
const MAX_CACHE_SIZE = 100;

async function serialize(msg, conn) {
	if (!msg || !conn) return
	if (msg.key) {
		msg.id = msg.key.id;
		msg.isSelf = msg.key.fromMe;
		msg.from = msg.key.remoteJid;
		msg.isGroup = msg.from.endsWith('@g.us')
		msg.sender = msg.isGroup ? msg.key.participant : msg.isSelf ? conn.user.id : msg.from;
		msg.device = getDevice(msg.key.id);
	}

	if (msg.message) {
		msg.type = getContentType(msg.message);

		try {
			msg.mentions = msg.message[msg.type]?.contextInfo?.mentionedJid || [];
		} catch {
			msg.mentions = false;
		}

		try {
			const quoted = msg.message[msg.type]?.contextInfo;
			if (quoted && quoted.quotedMessage) {
				let quotedSender = quoted.participant || quoted.remoteJid || msg.from;
				let quotedType;

				if (quoted.quotedMessage['ephemeralMessage']) {
					quotedType = Object.keys(quoted.quotedMessage.ephemeralMessage.message)[0];
					msg.quoted = {
						type: 'ephemeral',
						stanzaId: quoted.stanzaId,
						sender: quotedSender,
						message: quoted.quotedMessage.ephemeralMessage.message[quotedType],
					};
				} else {
					msg.quoted = {
						type: 'normal',
						stanzaId: quoted.stanzaId,
						sender: quotedSender,
						message: quoted.quotedMessage,
					};
				}

				msg.quoted.isSelf = msg.quoted.sender === conn.user.id;
				msg.quoted.mtype = Object.keys(msg.quoted.message)[0];
				msg.quoted.text = msg.quoted.message[msg.quoted.mtype]?.text || msg.quoted.message[msg.quoted.mtype]?.description || msg.quoted.message[msg.quoted.mtype]?.caption || '';
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
		try {
			msg.body = msg.body || msg.message.conversation || msg.message[msg.type]?.text || msg.message[msg.type]?.caption || false;
		} catch {
			msg.body = false;
		}
	}

	await saveMessage(msg, msg.pushName);
	return msg;
}

export { serialize };