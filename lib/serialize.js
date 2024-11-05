import { getContentType } from 'baileys';
import { parsedJid } from './utils.js';
import { SUDO } from '../config.js';

async function serialize(msg, conn) {
	conn.logger = { info() {}, error() {}, warn() {} };
	if (msg.key) {
		msg.id = msg.key.id;
		msg.isSelf = msg.key.fromMe;
		msg.from = msg.key.remoteJid;
		msg.isGroup = msg.from.endsWith('@g.us');

		msg.sender = msg.isGroup ? msg.key.participant : msg.isSelf ? conn.user.id : msg.from;

		try {
			if (msg.isGroup) {
				const groupMetadata = await conn.groupMetadata(msg.from);
				msg.isAdmin = groupMetadata.participants.find(p => p.id === msg.sender)?.admin !== null;
				msg.isBotAdmin = groupMetadata.participants.find(p => p.id === conn.user.id)?.admin !== null;
				msg.groupName = groupMetadata.subject;
				msg.groupDesc = groupMetadata.desc;
				msg.groupMembers = groupMetadata.participants;
				msg.groupAdmins = groupMetadata.participants.filter(p => p.admin !== null).map(p => p.id);
			}
			try {
				msg.sudo = SUDO.split(',').includes(msg.senderJid.split('@')[0]) || msg.key.fromMe;
			} catch {
				msg.sudo = false;
			}
		} catch {
			msg.isAdmin = false;
			msg.isBotAdmin = false;
			msg.sudo = false;
		}
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
				if (quoted.quotedMessage['ephemeralMessage']) {
					type = Object.keys(quoted.quotedMessage.ephemeralMessage.message)[0];
					msg.quoted = {
						type: type === 'viewOnceMessageV2' ? 'view_once' : 'ephemeral',
						stanzaId: quoted.stanzaId,
						sender: quoted.participant,
						message: type === 'viewOnceMessageV2' ? quoted.quotedMessage.ephemeralMessage.message.viewOnceMessageV2.message : quoted.quotedMessage.ephemeralMessage.message,
					};
				} else if (quoted.quotedMessage['viewOnceMessageV2']) {
					msg.quoted = {
						type: 'view_once',
						stanzaId: quoted.stanzaId,
						sender: quoted.participant,
						message: quoted.quotedMessage.viewOnceMessageV2.message,
					};
				} else if (quoted.quotedMessage['viewOnceMessageV2Extension']) {
					msg.quoted = {
						type: 'view_once_audio',
						stanzaId: quoted.stanzaId,
						sender: quoted.participant,
						message: quoted.quotedMessage.viewOnceMessageV2Extension.message,
					};
				} else {
					msg.quoted = {
						type: 'normal',
						stanzaId: quoted.stanzaId,
						sender: quoted.participant,
						message: quoted.quotedMessage,
					};
				}

				msg.quoted.isSelf = msg.quoted.sender === conn.user.id;
				msg.quoted.mtype = Object.keys(msg.quoted.message);

				msg.quoted.text = msg.quoted.message[msg.quoted.mtype]?.text || msg.quoted.message[msg.quoted.mtype]?.description || msg.quoted.message[msg.quoted.mtype]?.caption || (msg.quoted.mtype === 'templateButtonReplyMessage' && msg.quoted.message[msg.quoted.mtype].hydratedTemplate?.hydratedContentText) || msg.quoted.message[msg.quoted.mtype] || '';
				msg.quoted.key = {
					id: msg.quoted.stanzaId,
					fromMe: msg.quoted.isSelf,
					remoteJid: msg.from,
				};
			}
		} catch {
			msg.quoted = null;
		}

		try {
			msg.body =
				msg.message.conversation ||
				msg.message[msg.type]?.text ||
				msg.message[msg.type]?.caption ||
				(msg.type === 'listResponseMessage' && msg.message[msg.type].singleSelectReply.selectedRowId) ||
				(msg.type === 'buttonsResponseMessage' && msg.message[msg.type].selectedButtonId && msg.message[msg.type].selectedButtonId) ||
				(msg.type === 'templateButtonReplyMessage' && msg.message[msg.type].selectedId) ||
				false;
		} catch {
			msg.body = false;
		}
		conn.client = msg;
	}
	return msg;
}

export { serialize };
