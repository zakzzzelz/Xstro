import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { createRequire } from "module";
import { existsSync, mkdirSync } from "fs";
import pino from "pino";

import * as baileys from "baileys";
import { commands } from "./plugins.js";
import { MODE, AUTO_READ, AUTO_STATUS_READ, LOGS } from "../config.js";
import { serialize } from "./serialize.js";
import { Greetings } from "./group.js";
import Message from "./message.js";
import { saveChat, saveMessage, saveContact } from "./store.js";

const { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, Browsers, makeCacheableSignalKeyStore, DisconnectReason } = baileys;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

const logger = pino({ level: "silent" });
const sessionDir = "../session";

if (!existsSync(sessionDir)) mkdirSync(sessionDir);

const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

const handleCommandError = async (err, conn, msg, cmd) => {
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

const connect = async () => {
	const { state, saveCreds } = await useMultiFileAuthState(join(__dirname, sessionDir));
	const { version } = await fetchLatestBaileysVersion();

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

	conn.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
		if (connection === "connecting") {
			console.log("Connecting....");
		} else if (connection === "open") {
			console.log("Bot Connected");
			const { version: pkgVersion } = require("../package.json");
			const status = `\`\`\`xstro connected\nversion: ${pkgVersion}\nplugins: ${commands.length}\nmode: ${MODE}\`\`\``;
			await conn.sendMessage(conn.user.id, { text: status });
		} else if (connection === "close") {
			lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut ? connect() : process.exit(0);
		}
	});

	conn.ev.on("creds.update", saveCreds);
	conn.ev.on("group-participants.update", (data) => Greetings(data, conn));
	conn.ev.on("chats.update", (chats) => chats.forEach(saveChat));

	conn.ev.on("messages.upsert", async ({ messages, type }) => {
		if (type !== "notify") return;

		const msg = await serialize(JSON.parse(JSON.stringify(messages[0])), conn);
		const user = msg.sender;

		if (AUTO_READ) await conn.readMessages([msg.key]);
		if (AUTO_STATUS_READ && msg.from === "status@broadcast") await conn.readMessages([msg.key]);
		if (!msg?.body) return;

		if (LOGS) {
			const name = await msg.pushName;
			const group = msg.from.endsWith("@g.us") ? (await conn.groupMetadata(msg.from)).subject : msg.from;
			console.log(`At: ${group}\nFrom: ${name}\nMessage: ${msg.body || msg}`);
		}

		await saveMessage(msg, user);
		await saveContact(user, msg.pushName);
		// await saveChat({ id: msg.from, conversationTimestamp: Date.now() });

		for (const cmd of commands) {
			const execCmd = async (args) => {
				const Instance = new Message(conn, msg);
				try {
					if (cmd.function.constructor.name === "AsyncFunction") {
						await cmd.function(Instance, ...args, msg, conn, messages);
					} else {
						cmd.function(Instance, ...args, msg, conn, messages);
					}
				} catch (err) {
					await handleCommandError(err, conn, msg, cmd);
				}
			};

			if (msg.body && cmd.pattern) {
				const match = msg.body.match(cmd.pattern);
				if (match) {
					msg.prefix = match[1];
					msg.command = `${match[1]}${match[2]}`;
					await execCmd([match[3] || false]);
					continue;
				}
			}

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
		}
	});

	return conn;
};

export default connect;
