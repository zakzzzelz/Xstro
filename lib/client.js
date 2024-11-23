import * as baileys from 'baileys';
import config from '../config.js';
import fs from 'fs';
import Message from './class/Base.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { commands } from './handler.js';
import { logger } from './logger.js';
import { handleMessage } from './message.js';
import { handleAntiWord } from './events/antiword.js';
import { handleAntiLink } from './events/antilink.js';
import { getSession } from './session.js';
import { saveChat } from './sql/store.js';
import { serialize } from './serialize.js';
import { handleAntiDelete, storeMessage } from './events/antidelete.js';
import { fancy } from '../plugins/client/font.js';
import { handleGroupParticipants } from './events/greetings.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const connect = async () => {
	await getSession();
	let state, saveCreds;
	const sessionPath = path.join(__dirname, '../session');
	if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath, { recursive: true });
	const session = await baileys.useMultiFileAuthState(sessionPath);
	state = session.state;
	saveCreds = session.saveCreds;

	const { version } = await baileys.fetchLatestBaileysVersion();
	const cache = new Map();
	const CACHE_TTL = 5 * 60 * 1000;

	const conn = baileys.makeWASocket({
		auth: {
			creds: state.creds,
			keys: baileys.makeCacheableSignalKeyStore(state.keys, logger),
		},
		printQRInTerminal: true,
		logger,
		browser: baileys.Browsers.macOS('Safari'),
		version,
		syncFullHistory: true,
		markOnlineOnConnect: false,
		fireInitQueries: true,
		emitOwnEvents: true,
		getMessage: async key => {
			const cached = cache.get(key.id);
			if (cached) return cached;
			return { conversation: null };
		},
	});
	conn.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
		if (connection === 'close') {
			lastDisconnect.error?.output?.statusCode !== baileys.DisconnectReason.loggedOut ? connect() : process.exit(0);
		} else if (connection === 'open') {
			const status = `xstro ${config.VERSION}\nprefix: ${config.PREFIX}\nplugins: ${commands.length}\nmode: ${config.MODE}`;
			await conn.sendMessage(conn.user.id, { text: fancy(status) });
			console.log(`Connected`);
			console.log(status);
		} else if (connection === 'connecting') {
			console.log('Connecting...');
		}
	});
	conn.ev.on('creds.update', saveCreds);
	conn.ev.on('chats.update', chats => chats.forEach(saveChat));
	conn.ev.on('messages.upsert', async ({ messages, type }) => {
		if (type === 'notify') {
			const msg = await serialize(JSON.parse(JSON.stringify(messages[0])), conn);
			storeMessage(msg);
			const __events = new Message(conn, msg);
			if (msg.from && msg.body && msg.isGroup) await handleAntiWord(conn, msg);
			if (msg.from && msg.body && msg.isGroup) await handleAntiLink(conn, msg);
			await handleMessage(msg, conn, cache, __events);
		}
	});
	conn.ev.on('messages.update', async updates => {
		await handleAntiDelete(conn, updates);
	});
	handleGroupParticipants(conn);
	conn.ev.flush();
	setInterval(() => cache.clear(), CACHE_TTL);
	(() => {
		for (const cmd of commands) if (cmd.pattern) cache.set(cmd.pattern.toString(), cmd);
	})();
	return conn;
};

export default connect;
