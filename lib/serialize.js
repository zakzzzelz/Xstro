import { getContentType } from "baileys";
import { promises as fs } from "fs";
import * as fileType from "file-type";
import { join } from "path";
import { writeExifImg, writeExifVid, imageToWebp, videoToWebp } from "./sticker.js";
import { parsedJid } from "./utils.js";
import { SUDO } from "../config.js";

async function serialize(msg, conn) {
	conn.logger = { info() {}, error() {}, warn() {} };
	if (msg.key) {
		msg.id = msg.key.id;
		msg.isSelf = msg.key.fromMe;
		msg.from = msg.key.remoteJid;
		msg.isGroup = msg.from.endsWith("@g.us");

		msg.sender = msg.isGroup ? msg.key.participant : msg.isSelf ? conn.user.id : msg.from;

		try {
			msg.sudo = SUDO.split(",").includes(parsedJid(msg.sender)[0].split("@")[0]) || msg.key.fromMe;
		} catch {
			msg.sudo = false;
		}
	}

	if (msg.message) {
		msg.type = getContentType(msg.message);

		try {
			msg.mentions = msg.message[msg.type]?.contextInfo?.mentionedJid || [];
		} catch {
			msg.mentions = false;
		}

		try {
			const quoted = msg.message[msg.type]?.contextInfo;
			if (quoted && quoted.quotedMessage) {
				if (quoted.quotedMessage["ephemeralMessage"]) {
					type = Object.keys(quoted.quotedMessage.ephemeralMessage.message)[0];
					msg.quoted = {
						type: type === "viewOnceMessageV2" ? "view_once" : "ephemeral",
						stanzaId: quoted.stanzaId,
						sender: quoted.participant,
						message: type === "viewOnceMessageV2" ? quoted.quotedMessage.ephemeralMessage.message.viewOnceMessageV2.message : quoted.quotedMessage.ephemeralMessage.message,
					};
				} else if (quoted.quotedMessage["viewOnceMessageV2"]) {
					msg.quoted = {
						type: "view_once",
						stanzaId: quoted.stanzaId,
						sender: quoted.participant,
						message: quoted.quotedMessage.viewOnceMessageV2.message,
					};
				} else if (quoted.quotedMessage["viewOnceMessageV2Extension"]) {
					msg.quoted = {
						type: "view_once_audio",
						stanzaId: quoted.stanzaId,
						sender: quoted.participant,
						message: quoted.quotedMessage.viewOnceMessageV2Extension.message,
					};
				} else {
					msg.quoted = {
						type: "normal",
						stanzaId: quoted.stanzaId,
						sender: quoted.participant,
						message: quoted.quotedMessage,
					};
				}

				msg.quoted.isSelf = msg.quoted.sender === conn.user.id;
				msg.quoted.mtype = Object.keys(msg.quoted.message);

				msg.quoted.text = msg.quoted.message[msg.quoted.mtype]?.text || msg.quoted.message[msg.quoted.mtype]?.description || msg.quoted.message[msg.quoted.mtype]?.caption || (msg.quoted.mtype === "templateButtonReplyMessage" && msg.quoted.message[msg.quoted.mtype].hydratedTemplate?.hydratedContentText) || msg.quoted.message[msg.quoted.mtype] || "";
				msg.quoted.key = {
					id: msg.quoted.stanzaId,
					fromMe: msg.quoted.isSelf,
					remoteJid: msg.from,
				};
				msg.quoted.download = (pathFile) => downloadMedia(msg.quoted.message, pathFile);
			}
		} catch (error) {
			console.error("Error in processing quoted message:", error);
			msg.quoted = null;
		}

		try {
			msg.body =
				msg.message.conversation ||
				msg.message[msg.type]?.text ||
				msg.message[msg.type]?.caption ||
				(msg.type === "listResponseMessage" && msg.message[msg.type].singleSelectReply.selectedRowId) ||
				(msg.type === "buttonsResponseMessage" && msg.message[msg.type].selectedButtonId && msg.message[msg.type].selectedButtonId) ||
				(msg.type === "templateButtonReplyMessage" && msg.message[msg.type].selectedId) ||
				false;
		} catch (error) {
			console.error("Error in extracting message body:", error);
			msg.body = false;
		}
		conn.client = msg;

		conn.getFile = async (PATH, returnAsFilename) => {
			let res, filename;
			let data = Buffer.isBuffer(PATH) ? PATH : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split`,`[1], "base64") : /^https?:\/\//.test(PATH) ? await (res = await fetch(PATH)).buffer() : fs.existsSync(PATH) ? ((filename = PATH), fs.readFileSync(PATH)) : typeof PATH === "string" ? PATH : Buffer.alloc(0);
			if (!Buffer.isBuffer(data)) throw new TypeError("Result is not a buffer");
			let type = (await fileType.fromBuffer(data)) || {
				mime: "application/octet-stream",
				ext: ".bin",
			};
			if (data && returnAsFilename && !filename) (filename = join(__dirname, "../" + new Date() * 1 + "." + type.ext)), await fs.promises.writeFile(filename, data);
			return {
				res,
				filename,
				...type,
				data,
			};
		};

		conn.sendImageAsSticker = async (jid, buff, options = {}) => {
			let buffer;
			if (options && (options.packname || options.author)) {
				buffer = await writeExifImg(buff, options);
			} else {
				buffer = await imageToWebp(buff);
			}
			await conn.sendMessage(jid, { sticker: { url: buffer }, ...options }, options);
		};

		conn.sendVideoAsSticker = async (jid, buff, options = {}) => {
			let buffer;
			if (options && (options.packname || options.author)) {
				buffer = await writeExifVid(buff, options);
			} else {
				buffer = await videoToWebp(buff);
			}
			await conn.sendMessage(jid, { sticker: { url: buffer }, ...options }, options);
		};
	}
	return msg;
}

export { serialize };
