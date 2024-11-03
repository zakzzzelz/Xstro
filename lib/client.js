import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { createRequire } from "module";
import { existsSync, mkdirSync } from "fs";
import pino from "pino";

import * as baileys from "baileys";
import { commands } from "./plugins.js";
import { MODE, AUTO_READ, AUTO_STATUS_READ, LOGS, VERSION } from "../config.js";
import { serialize } from "./serialize.js";
import Message from "./message.js";
import { saveChat, saveMessage, saveContact } from "./store.js";

const { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, Browsers, makeCacheableSignalKeyStore, DisconnectReason } = baileys;

const setupBasicConfigs = () => {
	const __filename = fileURLToPath(import.meta.url);
	const __dirname = dirname(__filename);
	const require = createRequire(import.meta.url);
	const logger = pino({ level: "silent" });
	const sessionDir = "../session";

	if (!existsSync(sessionDir)) mkdirSync(sessionDir);

	return { __dirname, logger, sessionDir };
};

const createCache = () => {
	const cache = new Map();
	const CACHE_TTL = 5 * 60 * 1000;
	return { cache, CACHE_TTL };
};

const handleCommandError = async (conn, msg, cmd, err) => {
	const userNum = msg.sender.split("@")[0].split(":")[0];
	return await conn.sendMessage(
		msg.from,
		{
			text: `\`\`\`ERROR REPORT\nFROM: @${userNum}\nCOMMAND: ${cmd.pattern.toString().split(/\W+/)[1]}\nERROR: ${err.message}\`\`\``,
			mentions: [`${userNum}@s.whatsapp.net`],
		},
		{ quoted: msg },
	);
};

const setupConnection = async (__dirname, logger, sessionDir) => {
	const { state, saveCreds } = await useMultiFileAuthState(join(__dirname, sessionDir));
	const { version } = await fetchLatestBaileysVersion();
	const { cache } = createCache();

	const conn = makeWASocket({
		auth: {
			creds: state.creds,
			keys: makeCacheableSignalKeyStore(state.keys, logger),
		},
		printQRInTerminal: true,
		logger,
		browser: Browsers.macOS("Desktop"),
		downloadHistory: false,
		syncFullHistory: false,
		markOnlineOnConnect: false,
		emitOwnEvents: true,
		version,
		getMessage: async (key) => {
			const cached = cache.get(key.id);
			if (cached) return cached;
			return { conversation: null };
		},
	});

	return { conn, saveCreds };
};

const handleConnectionUpdate = async (conn, connection, lastDisconnect) => {
	if (connection === "connecting") {
		console.log("Connecting....");
	} else if (connection === "open") {
		console.log("Bot Connected");
		const status = `xstro connected\nversion: ${VERSION}\nplugins: ${commands.length}\nmode: ${MODE}`;
		await conn.sendMessage(conn.user.id, { text: "```" + status + "```" });
		console.log(status);
	} else if (connection === "close") {
		lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut ? connect() : process.exit(0);
	}
};

const logMessageIfEnabled = async (conn, msg) => {
	if (LOGS) {
		const name = await msg.pushName;
		const group = msg.from.endsWith("@g.us") ? (await conn.groupMetadata(msg.from)).subject : msg.from;
		console.log(`At: ${group}\nFrom: ${name}\nMessage: ${msg.body || msg}`);
	}
};

const handleAutoRead = async (conn, msg) => {
	if (AUTO_READ) await conn.readMessages([msg.key]);
	if (AUTO_STATUS_READ && msg.from === "status@broadcast") {
		await conn.readMessages([msg.key]);
	}
};

const saveMessageData = async (msg, user) => {
	await saveMessage(msg, user);
	await saveContact(user, msg.pushName);
};

const executePatternCommand = async (conn, cmd, msg, match) => {
	msg.prefix = match[1];
	msg.command = `${match[1]}${match[2]}`;

	const Instance = new Message(conn, msg);
	try {
		if (cmd.function.constructor.name === "AsyncFunction") {
			await cmd.function(Instance, match[3] || false, msg, conn);
		} else {
			cmd.function(Instance, match[3] || false, msg, conn);
		}
		return true;
	} catch (err) {
		await handleCommandError(conn, msg, cmd, err);
		return true;
	}
};

const executeEventCommand = async (conn, cmd, msg) => {
	const Instance = new Message(conn, msg);
	const execCmd = async (args) => {
		try {
			if (cmd.function.constructor.name === "AsyncFunction") {
				await cmd.function(Instance, ...args, msg, conn);
			} else {
				cmd.function(Instance, ...args, msg, conn);
			}
		} catch (err) {
			await handleCommandError(conn, msg, cmd, err);
		}
	};

	switch (cmd.on) {
		case "text":
			if (msg.body) await execCmd([msg.body]);
			break;
		case "image":
			if (msg.type === "imageMessage") await execCmd([]);
			break;
		case "sticker":
			if (msg.type === "stickerMessage") await execCmd([]);
			break;
		case "video":
			if (msg.type === "videoMessage") await execCmd([]);
			break;
		case "message":
			await execCmd([]);
			break;
	}
};

const processMessage = async (conn, message) => {
	const msg = await serialize(JSON.parse(JSON.stringify(message)), conn);
	const user = msg.sender;

	await handleAutoRead(conn, msg);
	if (!msg?.body) return;

	await logMessageIfEnabled(conn, msg);
	await saveMessageData(msg, user);

	for (const cmd of commands) {
		if (msg.body && cmd.pattern) {
			const match = msg.body.match(cmd.pattern);
			if (match && (await executePatternCommand(conn, cmd, msg, match))) {
				continue;
			}
		}

		await executeEventCommand(conn, cmd, msg);
	}
};

const connect = async () => {
	const { __dirname, logger, sessionDir } = setupBasicConfigs();
	const { conn, saveCreds } = await setupConnection(__dirname, logger, sessionDir);

	conn.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
		await handleConnectionUpdate(conn, connection, lastDisconnect);
	});

	conn.ev.on("creds.update", saveCreds);
	conn.ev.on("chats.update", (chats) => chats.forEach(saveChat));

	conn.ev.on("messages.upsert", async ({ messages, type }) => {
		if (type !== "notify") return;
		await processMessage(conn, messages[0]);
	});

	return conn;
};

export default connect;
