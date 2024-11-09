import * as baileys from 'baileys';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { commands } from './client/plugins.js';
import { MODE, AUTO_READ, AUTO_STATUS_READ, LOGS, VERSION, SESSION_ID, CMD_REACT, PREFIX, SESSION_DB } from '../config.js';
import { serialize } from './serialize.js';
import Message from './message.js';
import { saveChat, saveMessage, saveContact } from './sql/store.js';
import { fancy } from './extras/font.js';
import { logger, numtoId } from './utils.js';
import { handleAntiWord } from './client/antiword.js';
import { handleAntiLink } from './client/antilink.js';
import { useSQLiteAuthState } from './session.js';

const { makeWASocket, fetchLatestBaileysVersion, Browsers, makeCacheableSignalKeyStore, DisconnectReason } = baileys;
const __dirname = dirname(fileURLToPath(import.meta.url));

const connect = async () => {
	let state, saveCreds;

	if (SESSION_DB) {
		const session = await useSQLiteAuthState(SESSION_ID);
		state = session.state;
		saveCreds = session.saveCreds;
		await session.deleteSession();
	} else {
		const session = await baileys.useMultiFileAuthState(join(__dirname, '../session'));
		state = session.state;
		saveCreds = session.saveCreds;
	}
	const { version } = await fetchLatestBaileysVersion();
	const cache = new Map();
	const CACHE_TTL = 5 * 60 * 1000;
	setInterval(() => cache.clear(), CACHE_TTL);

	const conn = makeWASocket({
		auth: {
			creds: state.creds,
			keys: makeCacheableSignalKeyStore(state.keys, logger),
		},
		printQRInTerminal: true,
		logger,
		browser: Browsers.macOS('Desktop'),
		version,
		downloadHistory: false,
		syncFullHistory: false,
		markOnlineOnConnect: false,
		emitOwnEvents: true,
		getMessage: async key => {
			const cached = cache.get(key.id);
			if (cached) return cached;
			return { conversation: null };
		},
	});

	const handleMessage = async rawMessage => {
		const msg = await serialize(JSON.parse(JSON.stringify(rawMessage)), conn);
		if (!msg?.body) return;

		if (AUTO_READ) await conn.readMessages([msg.key]);
		if (AUTO_STATUS_READ && msg.from === 'status@broadcast') await conn.readMessages([msg.key]);

		if (LOGS) console.log(`At: ${msg.from.endsWith('@g.us') ? (await conn.groupMetadata(msg.from)).subject : msg.from}\nFrom: ${await msg.pushName}\nMessage: ${msg.body || msg}`);

		await saveMessage(msg, msg.sender);
		await saveContact(msg.sender, msg.pushName);

		async function execmd(cmd, msg, conn) {
			const Instance = new Message(conn, msg);
			try {
				if (cmd.on) {
					if (cmd.on === 'delete' && msg.type === 'protocolMessage') {
						const whats = new Message(conn, msg);
						whats.id = msg.message.protocolMessage.key?.id;
						await cmd.function(whats, msg, conn);
					} else {
						await cmd.function(Instance, msg.body || '', msg, conn);
					}
				} else if (cmd.pattern) {
					const match = msg.body.match(cmd.pattern);
					if (match && match[0] === msg.body) {
						const isPrefix = match[1];
						if (isPrefix === PREFIX) {
							const args = match[3] ?? '';
							if (CMD_REACT) await Instance.react('⌛');
							await baileys.delay(500);
							await cmd.function(Instance, args, msg, conn);
						}
					}
				}
			} catch (err) {
				const user = msg.sender.split('@')[0].split(':')[0];
				const cmdName = cmd.pattern.toString().split(/\W+/)[2] || cmd.on;
				const errMsg = `─━❲ ERROR REPORT ❳━─\nFROM: @${user}\nMESSAGE: ${err.message}\nCMD: ${cmdName}`;
				return await conn.sendMessage(Instance.user, { text: '```' + errMsg + '```', mentions: [numtoId(user)] }, { quoted: msg });
			}
		}

		for (const cmd of commands) {
			if (msg.body && cmd.pattern) {
				const match = msg.body.match(cmd.pattern);
				if (match) {
					const modifiedMsg = { ...msg, prefix: match[1], command: `${match[1]}${match[2]}` };
					await execmd(cmd, modifiedMsg, conn);
					continue;
				}
			}

			if (cmd.on) {
				await execmd(cmd, msg, conn);
			}
		}
	};

	conn.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
		if (connection === 'open') {
			const status = `xstro ${VERSION}\nprefix: ${PREFIX}\nplugins: ${commands.length}\nmode: ${MODE}`;
			await conn.sendMessage(conn.user.id, { text: fancy(status) });
			console.log(`Connected To WhatsApp`);
		} else if (connection === 'close') lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut ? connect() : process.exit(0);
	});

	conn.ev.on('creds.update', saveCreds);
	conn.ev.on('chats.update', chats => chats.forEach(saveChat));
	conn.ev.on('messages.upsert', async ({ messages, type }) => {
		if (type === 'notify') {
			const msg = await serialize(JSON.parse(JSON.stringify(messages[0])), conn);
			if (msg.from && msg.body && msg.isGroup) await handleAntiWord(conn, msg);
			if (msg.from && msg.body && msg.isGroup) await handleAntiLink(conn, msg);
			await handleMessage(messages[0]);
		}
	});

	return conn;
};

export default connect;
