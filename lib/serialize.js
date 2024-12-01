import { getContentType } from 'baileys';

export async function serialize(msg, conn) {
	if (!msg) return;

	if (msg.key) {
		msg.id = msg.key.id;
		msg.isSelf = msg.key.fromMe;
		msg.from = msg.key.remoteJid;
		msg.isGroup = msg.from.endsWith('@g.us');
		msg.sender = msg.isGroup ? msg.key.participant : msg.isSelf ? conn.user.id : msg.from;
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
				let sender = msg.message[msg.type]?.contextInfo?.participant || msg.message[msg.type]?.contextInfo?.remoteJid || msg.from;
				let type;

				if (quoted['viewOnceMessageV2']) {
					const quotedViewOnce = quoted.viewOnceMessageV2.message;
					const quotedViewOnceType = Object.keys(quotedViewOnce)[0];

					msg.quoted = {
						type: 'viewOnce',
						stanzaId: msg.message[msg.type]?.contextInfo?.stanzaId,
						sender: sender,
						message: quotedViewOnce,
						body: quotedViewOnce[quotedViewOnceType]?.text || quotedViewOnce[quotedViewOnceType]?.caption || quotedViewOnce[quotedViewOnceType]?.description || '',
					};
				} else {
					type = Object.keys(quoted)[0];

					msg.quoted = {
						type: 'normal',
						stanzaId: msg.message[msg.type]?.contextInfo?.stanzaId,
						sender: sender,
						message: quoted,
						body: quoted[type]?.text || quoted[type]?.caption || quoted[type]?.description || '',
					};
				}
				msg.quoted.isSelf = msg.quoted.sender === conn.user.id;
				msg.quoted.mtype = type;
				msg.quoted.text = msg.quoted.body;
				msg.quoted.key = {
					remoteJid: msg.from,
					fromMe: msg.quoted.isSelf,
					id: msg.quoted.stanzaId,
					participant: msg.quoted.sender,
				};
			}
		} catch {
			msg.quoted = false;
		}

		if (msg.message['ephemeralMessage']) {
			const ephemeralType = Object.keys(msg.message.ephemeralMessage.message)[0];
			msg.body = msg.body || msg.message.ephemeralMessage.message[ephemeralType]?.text || msg.message.ephemeralMessage.message[ephemeralType]?.caption || '';

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
			msg.body = msg.body || msg.message.conversation || msg.message[msg.type]?.text || msg.message[msg.type]?.caption || false;
		}
	}
	return msg;
}
