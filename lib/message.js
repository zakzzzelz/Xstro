import { getContentType, isJidGroup, jidNormalizedUser, normalizeMessageContent } from 'baileys';
import { getConfigValues } from './events.js';

export async function serialize(messages, conn) {
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
		prefix: (await getConfigValues()).PREFIX,
		user: owner,
		from: messages.key.remoteJid,
		pushName: messages.pushName,
		sender: isGroup ? messages.key?.participant ?? '' : messages.key?.fromMe ? owner ?? '' : jidNormalizedUser(messages.key?.remoteJid ?? ''),

		isGroup,
		client: conn,
		send: async (content, options = {}) => {
			const jid = options.jid || msg.key.remoteJid;
			const data = await conn.sendMessage(jid, { [options.type || 'text']: content, ...options }, { quoted: msg || options.quoted });
			return serialize(data, conn);
		},
		error: async (cmd, error) => {
			await msg.send(`\`\`\`An Error Occured while running ${cmd.pattern.toString().split(/\W+/)[2]} command!\`\`\``);
			const name = cmd.pattern.toString().split(/\W+/)[2] || 'UNKNOWN CMD';
			const { stack, message } = error;
			const data = await msg.send(`\`\`\`─━❲ ERROR REPORT ❳━─\n\nFROM: @${msg?.sender?.split('@')[0]}\nCMD: ${name}\nMESSAGE: ${message}\`\`\``, { jid: owner, mentions: [msg.sender] });
			return serialize(data, conn) && console.log(stack);
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
		const getPollBody = normalizedMessage => {
			if (normalizedMessage?.pollCreationMessageV3) {
				const pollData = normalizedMessage.pollCreationMessageV3;
				return [pollData.name, ...pollData.options.map(option => option.optionName)].join(', ');
			}
			return false;
		};
		Object.assign(msg, {
			message: normalizedMessage,
			type,
			participant: msg.key.participant || msg.key.remoteJid,
			mention: normalizedMessage?.[type]?.contextInfo?.mentionedJid || [],
			viewonce: normalizedMessage?.[type]?.viewOnce || false,
			body: normalizedMessage?.[type]?.editedMessage?.conversation || normalizedMessage?.[type]?.editedMessage?.text || normalizedMessage?.[type]?.editedMessage?.caption || normalizedMessage?.conversation || normalizedMessage?.[type]?.text || normalizedMessage?.[type]?.caption || getPollBody(normalizedMessage) || normalizedMessage?.eventMessage?.name || false,
		});
	}

	const quoted = messages.message?.[msg.type]?.contextInfo?.quotedMessage || messages.message?.[msg.type]?.contextInfo?.ephemeralMessage?.quotedMessage;
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
			body: quotedMessage?.conversation || quotedMessage?.[quotedType]?.text || quotedMessage?.[quotedType]?.caption || false, // Still need to add poll support
		};
	} else {
		msg.quoted = null;
	}
	Object.defineProperty(msg, 'client', {
		get: function () {
			return conn;
		},
		enumerable: false,
		configurable: false,
	});

	return msg;
}
