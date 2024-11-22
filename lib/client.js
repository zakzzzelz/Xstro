import * as baileys from 'baileys';
import config from '../config.js';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { commands } from './handler.js';
import { logger } from './utils.js';
import { handleMessage } from './message.js';
import { handleAntiWord } from './events/antiword.js';
import { handleAntiLink } from './events/antilink.js';
import { getSession } from './session.js';
import { existsSync } from 'fs';
import { saveChat } from './sql/store.js';
import { serialize } from './serialize.js';
import { handleAntiDelete, storeMessage } from './events/antidelete.js';
import { fancy } from '../plugins/client/font.js';
import { handleGroupParticipants } from './events/greetings.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const connect = async () => {
	await getSession();
	let state, saveCreds;
	const sessionPath = join(__dirname, '../session');
	if (!existsSync(sessionPath)) mkdirSync(sessionPath, { recursive: true });
	const session = await baileys.useMultiFileAuthState(sessionPath);
	state = session.state;
	saveCreds = session.saveCreds;

	const { version } = await baileys.fetchLatestBaileysVersion();
	const cache = new Map();
	const CACHE_TTL = 5 * 60 * 1000;
	setInterval(() => cache.clear(), CACHE_TTL);

	const conn = baileys.makeWASocket({
		auth: {
			creds: state.creds,
			keys: baileys.makeCacheableSignalKeyStore(state.keys, logger),
		},
		printQRInTerminal: true,
		logger,
		browser: baileys.Browsers.macOS('Desktop'),
		version,
		downloadHistory: true,
		syncFullHistory: true,
		markOnlineOnConnect: true,
		fireInitQueries: false,
		emitOwnEvents: true,
		getMessage: async key => {
			const cached = cache.get(key.id);
			if (cached) return cached;
			return { conversation: null };
		},
	});

	const patternCache = new Map();
	const cacheCommands = () => {
		for (const cmd of commands) if (cmd.pattern) patternCache.set(cmd.pattern.toString(), cmd);
	};
	cacheCommands();
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
			if (msg.from && msg.body && msg.isGroup) await handleAntiWord(conn, msg);
			if (msg.from && msg.body && msg.isGroup) await handleAntiLink(conn, msg);
			await handleMessage(messages[0], conn, patternCache);
		}
	});
	conn.ev.on('messages.update', async updates => {
		await handleAntiDelete(conn, updates);
	});
	handleGroupParticipants(conn)
	conn.ev.flush();
	return conn;
};

export default connect;
