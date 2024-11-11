import * as baileys from 'baileys';
import config from '../config.js';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { commands } from './client/plugins.js';
import { serialize } from './serialize.js';
import { saveChat } from './sql/store.js';
import { fancy } from './extras/font.js';
import { logger } from './utils.js';
import { handleAntiWord } from './client/antiword.js';
import { handleAntiLink } from './client/antilink.js';
import { existsSync, mkdirSync } from 'fs';
import { handleCommand } from './handler.js';
import { storeMessage, handleAntiDelete } from './client/antidelete.js';
import { saveMessageAndContact } from './client/messages.js';

const { makeWASocket, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, DisconnectReason } = baileys;
const { MODE, AUTO_READ, AUTO_STATUS_READ, LOGS, VERSION, PREFIX } = config;
const __dirname = dirname(fileURLToPath(import.meta.url));

let shouldRestart = true;

const connect = async () => {
	let state, saveCreds;
	const sessionPath = join(__dirname, '../session');
	if (!existsSync(sessionPath)) mkdirSync(sessionPath, { recursive: true });
	const session = await baileys.useMultiFileAuthState(sessionPath);
	state = session.state;
	saveCreds = session.saveCreds;

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
		browser: baileys.Browsers.macOS('Desktop'),
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
		await saveMessageAndContact(msg);
		if (AUTO_READ) await conn.readMessages([msg.key]);
		if (AUTO_STATUS_READ && msg.from === 'status@broadcast') await conn.readMessages([msg.key]);

		if (LOGS) {
			if (msg.from.endsWith('@g.us')) {
				const groupName = (await conn.groupMetadata(msg.from)).subject;
				console.log(`Group: ${groupName}\nFrom: ${await msg.pushName}\nMessage: ${msg.body || msg}`);
			} else {
				console.log(`${await msg.pushName}: ${msg.body || msg.type}`);
			}
		}

		for (const cmd of commands) {
			if (msg.body && cmd.pattern) {
				const match = msg.body.match(cmd.pattern);
				if (match) {
					const modifiedMsg = { ...msg, prefix: match[1], command: `${match[1]}${match[2]}` };
					await handleCommand(cmd, modifiedMsg, conn);
					continue;
				}
			}
			if (cmd.on) {
				await handleCommand(cmd, msg, conn);
			}
		}
	};

	conn.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
		if (qr && shouldRestart) {
			shouldRestart = false;
			setTimeout(() => {
				console.log('QR was scanned, restarting once...');
				connect();
			}, 5000);
		} else if (connection === 'close') {
			lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut ? connect() : process.exit(0);
		} else if (connection === 'open') {
			const status = `xstro ${VERSION}\nprefix: ${PREFIX}\nplugins: ${commands.length}\nmode: ${MODE}`;
			await conn.sendMessage(conn.user.id, { text: fancy(status) });
			console.log(`Connected To WhatsApp`);
		}
	});

	conn.ev.on('creds.update', saveCreds);
	conn.ev.on('chats.update', chats => chats.forEach(saveChat));
	conn.ev.on('messages.upsert', async ({ messages, type }) => {
		if (type === 'notify') {
			const msg = await serialize(JSON.parse(JSON.stringify(messages[0])), conn);
			storeMessage(msg);
			if (msg.from && msg.body && msg.isGroup) await handleAntiWord(conn, msg);
			if (msg.from && msg.body && msg.isGroup) await handleAntiLink(conn, msg);
			await handleMessage(messages[0]);
		}
	});
	conn.ev.on('messages.update', async updates => {
		await handleAntiDelete(conn, updates);
	});

	return conn;
};

export default connect;
