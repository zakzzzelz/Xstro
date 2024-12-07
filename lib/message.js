import { getContentType, isJidGroup, jidNormalizedUser, normalizeMessageContent } from 'baileys';

const metadataCache = new Map();
const MAX_CACHE_SIZE = 100;
const GROUP_CACHE_TIMEOUT = 30000;
const processedMessages = new Set();

export async function smsg(messages, conn) {
	if (processedMessages.has(messages.key.id)) return messages;

	const owner = jidNormalizedUser(conn.user.id);
	const isGroup = isJidGroup(messages.key.remoteJid);
	const remoteJid = isGroup ? messages.key.remoteJid : jidNormalizedUser(messages.key.remoteJid);

	const msg = {
		key: {
			id: messages.key.id,
			fromMe: messages.key.fromMe,
			remoteJid,
			participant: isGroup ? messages.key.participant : undefined,
		},
		from: messages.key.remoteJid,
		pushName: messages.pushName,
		sender: messages.key.participant || messages.key.remoteJid,
		isGroup,
	};

	if (isGroup) {
		let metadata = metadataCache.get(remoteJid);
		if (!metadata) {
			metadata = await conn.groupMetadata(remoteJid);
			metadataCache.set(remoteJid, metadata);
			if (metadataCache.size > MAX_CACHE_SIZE) metadataCache.delete(metadataCache.keys().next().value);
		}
		const participant = messages.key.participant;
		msg.isAdmin = !!metadata.participants.find(p => p.id === participant)?.admin;
		msg.isBotAdmin = !!metadata.participants.find(p => p.id === owner)?.admin;
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
	} else msg.quoted = false;

	processedMessages.add(messages.key.id);
	return msg;
}

setInterval(() => {
	metadataCache.clear();
	processedMessages.clear();
}, GROUP_CACHE_TIMEOUT);
