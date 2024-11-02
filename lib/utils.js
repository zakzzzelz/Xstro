import axios from "axios";
import bot from "baileys";
const { jidDecode, generateWAMessageFromContent, proto } = bot;
import * as fileType from "file-type";

function handleError(error) {
	console.error("Error: ", error.message);
	throw error;
}

function createInteractiveMessage(data, options = {}) {
	const { jid, button, header, footer, body } = data;
	let buttons = button.map((btn) => {
		let Button = { buttonParamsJson: JSON.stringify(btn.params) };
		switch (btn.type) {
			case "copy":
				Button.name = "cta_copy";
				break;
			case "url":
				Button.name = "cta_url";
				break;
			case "location":
				Button.name = "send_location";
				break;
			case "address":
				Button.name = "address_message";
				break;
			case "call":
				Button.name = "cta_call";
				break;
			case "reply":
				Button.name = "quick_reply";
				break;
			case "list":
				Button.name = "single_select";
				break;
			default:
				Button.name = "quick_reply";
				break;
		}
		return Button;
	});
	const mess = {
		viewOnceMessage: {
			message: {
				messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
				interactiveMessage: proto.Message.InteractiveMessage.create({
					body: proto.Message.InteractiveMessage.Body.create({ ...body }),
					footer: proto.Message.InteractiveMessage.Footer.create({ ...footer }),
					header: proto.Message.InteractiveMessage.Header.create({ ...header }),
					nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({ buttons }),
				}),
			},
		},
	};
	return generateWAMessageFromContent(jid, mess, options);
}

async function getBuffer(url, options = {}) {
	const res = await axios({
		method: "get",
		url,
		headers: { DNT: 1, "Upgrade-Insecure-Request": 1 },
		...options,
		responseType: "arraybuffer",
	}).catch(handleError);
	return res.data;
}

const decodeJid = (jid) => {
	if (!jid) return jid;
	if (/:\d+@/gi.test(jid)) {
		const decode = jidDecode(jid) || {};
		return decode.user && decode.server ? `${decode.user}@${decode.server}` : jid;
	} else {
		return jid;
	}
};

async function FiletypeFromUrl(url) {
	const buffer = await getBuffer(url);
	const out = await fileType.fromBuffer(buffer).catch(handleError);
	let type = out ? out.mime.split("/")[0] : null;
	return { type, buffer };
}

function extractUrlFromMessage(message) {
	const urlRegex = /(https?:\/\/[^\s]+)/gi;
	const match = urlRegex.exec(message);
	return match ? match[0] : null;
}

async function getJson(url, options) {
	const res = await axios({
		method: "GET",
		url,
		headers: {
			"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36",
		},
		...options,
	}).catch(handleError);
	return res.data;
}
function parseJid(text = "") {
	return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map((v) => v[1] + "@s.whatsapp.net");
}

function parsedJid(text = "") {
	return [...text.matchAll(/([0-9]{5,16}|0)/g)].map((v) => v[1] + "@s.whatsapp.net");
}

function isUrl(url) {
	return new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, "gi").test(url);
}

function getUrl(url) {
	return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.\~#?&/=]*)/, "gi"));
}

function formatBytes(bytes, decimals = 2) {
	if (!+bytes) return "0 Bytes";
	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function clockString(duration) {
	let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
	let minutes = Math.floor((duration / (1000 * 60)) % 60);
	let seconds = Math.floor((duration / 1000) % 60);
	return `${hours < 10 ? "0" : ""}${hours}:${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

export { FiletypeFromUrl, getBuffer, extractUrlFromMessage, decodeJid, parseJid, parsedJid, getJson, isUrl, getUrl, formatBytes, clockString, createInteractiveMessage };
