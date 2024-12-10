import { getContentType, isJidGroup, jidNormalizedUser, normalizeMessageContent } from 'baileys';

const CACHE_TIMEOUT = 300000;
const cache = new Map();

export async function smsg(messages, conn) {
	if (cache.has(`processed_${messages.key.id}`)) return messages;

	const owner = jidNormalizedUser(conn.user.id);
	const isGroup = isJidGroup(messages.key.remoteJid);
	const remoteJid = isGroup ? messages.key.remoteJid : jidNormalizedUser(messages.key.remoteJid);

	const msg = {
		key: {
			id: messages.key.id,
			fromMe: messages.key.fromMe,
			remoteJid,
			participant: isGroup ? messages.key.participant : false,
		},
		from: messages.key.remoteJid,
		pushName: messages.pushName,
		sender: isGroup ? messages.key.participant : messages.key.fromMe ? owner : jidNormalizedUser(messages.key.remoteJid),
		isGroup,
	};
	if (isGroup) {
		let metadata = cache.get(`metadata_${remoteJid}`);
		if (!metadata) {
			metadata = await conn.groupMetadata(remoteJid);
			cache.set(`metadata_${remoteJid}`, metadata);
		}
		const participant = messages.key.participant;
		msg.isAdmin = !!metadata.participants.find(p => p.id === participant)?.admin || false;
		msg.isBotAdmin = !!metadata.participants.find(p => p.id === owner)?.admin || false;
	}

	if (messages.message) {
		const normalizedMessage = normalizeMessageContent(messages.message);
		const type = getContentType(normalizedMessage);
		Object.assign(msg, {
			message: normalizedMessage,
			type,
			participant: msg.key.participant || msg.key.remoteJid,
			mention: normalizedMessage?.[type]?.contextInfo?.mentionedJid || [],
			viewonce: normalizedMessage?.[type]?.viewOnce || false,
			body: normalizedMessage?.conversation || normalizedMessage?.[type]?.text || normalizedMessage?.[type]?.caption || false,
		});
	}

	const quoted = messages.message?.[msg.type]?.contextInfo?.quotedMessage;
	if (quoted) {
		const quotedMessage = normalizeMessageContent(quoted);
		const quotedType = getContentType(quotedMessage);
		msg.quoted = {
			key: {
				id: messages.message[msg.type]?.contextInfo?.stanzaId,
				fromMe: messages.message[msg.type]?.contextInfo?.participant === owner,
				remoteJid: isGroup ? remoteJid : jidNormalizedUser(messages.message[msg.type]?.contextInfo?.participant),
				participant: isGroup ? messages.message[msg.type]?.contextInfo?.participant : undefined,
			},
			message: quotedMessage,
			type: quotedType,
			viewonce: quotedMessage?.[quotedType]?.viewOnce || false,
			body: quotedMessage?.conversation || quotedMessage?.[quotedType]?.text || quotedMessage?.[quotedType]?.caption || false,
		};
	} else {
		msg.quoted = false;
	}
	cache.set(`processed_${messages.key.id}`, true);
	return msg;
}

setInterval(() => {
	cache.clear();
}, CACHE_TIMEOUT);
