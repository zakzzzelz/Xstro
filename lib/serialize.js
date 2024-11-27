import { getContentType, getDevice } from 'baileys';
import { saveMessage } from './sql/store.js';
import { getGroupMetadata, numtoId } from './utils.js';

async function serialize(msg, conn) {
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

					msg.body = msg.body || msg.quoted.message[quotedType]?.text || msg.quoted.message[quotedType]?.caption || msg.quoted.message[quotedType]?.description || '';
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
		const content = await conn.sendMessage(msg.from, { text: message.toString(), ...opts }, { quoted: opts.quoted })
		return serialize(content, conn)
	}
	await saveMessage(msg, msg.pushName);
	return msg;
}

export { serialize };