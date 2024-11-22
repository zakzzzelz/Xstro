import { getContentType, getDevice } from 'baileys';
import config from '../config.js';
import { isSudo } from './sql/sudo.js';
import { isBanned } from './sql/ban.js';
import { saveContact, saveMessage } from './sql/store.js';

const groupCache = new Map();
const metadataCache = new Map();
const MAX_CACHE_SIZE = 100;

setInterval(async () => {
	for (let groupId of groupCache.keys()) {
		try {
			let metadata = await conn.groupMetadata(groupId);
			metadataCache.set(groupId, metadata);
			if (metadataCache.size > MAX_CACHE_SIZE) {
				metadataCache.delete(metadataCache.keys().next().value);
			}
		} catch {}
	}
}, 10000);

async function serialize(msg, conn) {
	conn.logger = { info() {}, error() {}, warn() {} };
	if (msg.key) {
		msg.id = msg.key.id;
		msg.isSelf = msg.key.fromMe;
		msg.from = msg.key.remoteJid;
		msg.isGroup = groupCache.get(msg.from) ?? groupCache.set(msg.from, msg.from.endsWith('@g.us')).get(msg.from);
		if (groupCache.size > MAX_CACHE_SIZE) groupCache.delete(groupCache.keys().next().value);

		msg.sender = msg.isGroup ? msg.key.participant : msg.isSelf ? conn.user.id : msg.from;
		msg.device = getDevice(msg.key.id);

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
			msg.sudo = config.SUDO.split(',').includes(msg.sender.split('@')[0]) || msg.isSelf || msg.owner;
			msg.mode = config.MODE === 'private';
			msg.ban = await isBanned(msg.sender);
		} catch {}
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
						type: quotedType === 'viewOnceMessageV2' ? 'view_once' : 'ephemeral',
						stanzaId: quoted.stanzaId,
						sender: quotedSender,
						message: quoted.quotedMessage.ephemeralMessage.message[quotedType],
					};
				} else if (quoted.quotedMessage['viewOnceMessageV2']) {
					msg.quoted = {
						type: 'view_once',
						stanzaId: quoted.stanzaId,
						sender: quotedSender,
						message: quoted.quotedMessage.viewOnceMessageV2.message,
					};
				} else if (quoted.quotedMessage['viewOnceMessageV2Extension']) {
					msg.quoted = {
						type: 'view_once_audio',
						stanzaId: quoted.stanzaId,
						sender: quotedSender,
						message: quoted.quotedMessage.viewOnceMessageV2Extension.message,
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
			msg.body = msg.message.conversation || msg.message[msg.type]?.text || msg.message[msg.type]?.caption || false;
		} catch {
			msg.body = false;
		}
		conn.client = msg;
	}
	await saveContact(msg.sender, msg.pushName)
	await saveMessage(msg, msg.pushName)
	return msg;
}

export { serialize };
