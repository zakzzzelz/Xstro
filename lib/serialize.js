import { getContentType } from 'baileys';
import config from '../config.js';
const { MODE, SUDO } = config;
import { isSudo } from './sql/sudo.js';
import { isBanned } from './sql/ban.js';

const groupCache = new Map();
const metadataCache = new Map();
const MAX_CACHE_SIZE = 100;

function mode() {
	return MODE === 'private';
}

async function serialize(msg, conn) {
	conn.logger = { info() {}, error() {}, warn() {} };
	if (msg.key) {
		msg.id = msg.key.id;
		msg.isSelf = msg.key.fromMe;
		msg.from = msg.key.remoteJid;
		msg.isGroup = groupCache.get(msg.from) ?? groupCache.set(msg.from, msg.from.endsWith('@g.us')).get(msg.from);
		if (groupCache.size > MAX_CACHE_SIZE) groupCache.delete(groupCache.keys().next().value);

		msg.sender = msg.isGroup ? msg.key.participant : msg.isSelf ? conn.user.id : msg.from;

		try {
			if (msg.isGroup) {
				let metadata = metadataCache.get(msg.from);
				if (!metadata) {
					metadata = await conn.groupMetadata(msg.from);
					metadataCache.set(msg.from, metadata);
					if (metadataCache.size > MAX_CACHE_SIZE) metadataCache.delete(metadataCache.keys().next().value);
				}
				msg.isAdmin = metadata.participants.find(p => p.id === msg.sender)?.admin !== null;
				msg.isBotAdmin = metadata.participants.find(p => p.id === conn.user.id)?.admin !== null;
			}
			msg.owner = await isSudo(msg.sender);
			msg.sudo = SUDO.split(',').includes(msg.sender.split('@')[0]) || msg.isSelf || msg.owner;
			msg.mode = mode();
			msg.ban = await isBanned(msg.sender);
		} catch {
			msg.isAdmin = false;
			msg.isBotAdmin = false;
			msg.sudo = false;
			msg.isOwner = false;
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
					remoteJid: msg.from,
					fromMe: msg.quoted.isSelf,
					id: msg.quoted.stanzaId,
					participant: msg.sender,
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
