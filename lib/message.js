import { getContentType, isJidGroup, jidNormalizedUser, normalizeMessageContent } from 'baileys';

export async function smsg(messages, conn) {
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
		user: owner,
		from: messages.key.remoteJid,
		pushName: messages.pushName,
		sender: isGroup ? messages.key.participant : messages.key.fromMe ? owner : jidNormalizedUser(messages.key.remoteJid),
		isGroup,
		send: async (content, options = {}) => {
			const jid = options.jid || msg.key.remoteJid;
			const Msg = await conn.sendMessage(jid, { text: String(content), ...options }, { quoted: msg || options.quoted });
			return smsg(Msg, conn);
		},
		error: async (cmd, error) => {
			const name = cmd.pattern.toString().split(/\W+/)[2] || 'UNKNOWN CMD';
			const { stack, message } = error;
			const Msg = await msg.send(`\`\`\`─━❲ ERROR REPORT ❳━─\n\nFROM: @${msg.sender.split('@')[0]}\nCMD: ${name}\nMESSAGE: ${message}\`\`\``, { jid: owner, mentions: [msg.sender] });
			return smsg(Msg, conn) && console.log(stack);
		},
	};
	if (isGroup) {
		const metadata = await conn.groupMetadata(remoteJid);
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
	return msg;
}
