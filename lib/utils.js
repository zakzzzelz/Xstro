import { fileTypeFromBuffer } from 'file-type';
import axios from 'axios';
import pkg from 'baileys';
import crypto from 'crypto';
import { Buffer } from 'buffer';
import { Readable } from 'stream';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';
ffmpeg.setFfmpegPath(ffmpegPath.path);
const { jidDecode, generateWAMessageFromContent, proto } = pkg;

function handleError(error) {
	console.error('Error: ', error.message);
	throw error;
}

function createInteractiveMessage(data, options = {}) {
	const { jid, button, header, footer, body } = data;
	let buttons = button.map(btn => {
		let Button = { buttonParamsJson: JSON.stringify(btn.params) };
		switch (btn.type) {
			case 'copy':
				Button.name = 'cta_copy';
				break;
			case 'url':
				Button.name = 'cta_url';
				break;
			case 'location':
				Button.name = 'send_location';
				break;
			case 'address':
				Button.name = 'address_message';
				break;
			case 'call':
				Button.name = 'cta_call';
				break;
			case 'reply':
				Button.name = 'quick_reply';
				break;
			case 'list':
				Button.name = 'single_select';
				break;
			default:
				Button.name = 'quick_reply';
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
		method: 'get',
		url,
		headers: { DNT: 1, 'Upgrade-Insecure-Request': 1 },
		...options,
		responseType: 'arraybuffer',
	}).catch(handleError);
	return res.data;
}

const decodeJid = jid => {
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
	const out = await fileTypeFromBuffer(buffer).catch(handleError);
	let type = out ? out.mime.split('/')[0] : null;
	return { type, buffer };
}

function extractUrlFromMessage(message) {
	const urlRegex = /(https?:\/\/[^\s]+)/gi;
	const match = urlRegex.exec(message);
	return match ? match[0] : null;
}

async function getJson(url, options) {
	const res = await axios({
		method: 'GET',
		url,
		headers: {
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36',
		},
		...options,
	}).catch(handleError);
	return res.data;
}

const postJson = async (url, options) => {
	const { data, headers = {} } = options;
	const response = await axios
		.post(url, data, {
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36',
				...headers,
			},
		})
		.catch(handleError);
	return response.data;
};

function parseJid(text = '') {
	return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net');
}

function parsedJid(text = '') {
	return [...text.matchAll(/([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net');
}

function isUrl(url) {
	return new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi').test(url);
}

function getUrl(url) {
	return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.\~#?&/=]*)/, 'gi'));
}

function formatBytes(bytes, decimals = 2) {
	if (!+bytes) return '0 Bytes';
	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function clockString(duration) {
	let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
	let minutes = Math.floor((duration / (1000 * 60)) % 60);
	let seconds = Math.floor((duration / 1000) % 60);
	return `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

const runtime = function (seconds) {
	seconds = Number(seconds);
	var d = Math.floor(seconds / (3600 * 24));
	var h = Math.floor((seconds % (3600 * 24)) / 3600);
	var m = Math.floor((seconds % 3600) / 60);
	var s = Math.floor(seconds % 60);
	var dDisplay = d > 0 ? d + (d == 1 ? ' d ' : ' d ') : '';
	var hDisplay = h > 0 ? h + (h == 1 ? ' h ' : ' h ') : '';
	var mDisplay = m > 0 ? m + (m == 1 ? ' m ' : ' m ') : '';
	var sDisplay = s > 0 ? s + (s == 1 ? ' s' : ' s') : '';
	return dDisplay + hDisplay + mDisplay + sDisplay;
};

const getFloor = number => {
	return Math.floor(number);
};

const getRandom = array => {
	if (array.length === 0) return undefined;
	const randomIndex = Math.floor(Math.random() * array.length);
	return array[randomIndex];
};

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const getQueryParams = url => {
	const params = new URLSearchParams(new URL(url).search);
	return Object.fromEntries(params.entries());
};

const mergeObjects = (...objects) => {
	return Object.assign({}, ...objects);
};

const numberToJID = phoneNumber => {
	const jid = phoneNumber.replace(/\D/g, '');
	return `${jid}@s.whatsapp.net`;
};

const formatDate = date => {
	const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
	return new Intl.DateTimeFormat('en-US', options).format(date);
};

const generateUUID = () => {
	return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c => (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16));
};

const buffer = async url => {
	const response = await axios.get(url, { responseType: 'arraybuffer' });
	return Buffer.from(response.data);
};

const toAudio = inputBuffer => {
	return new Promise((resolve, reject) => {
		const stream = new Readable();
		stream.push(inputBuffer);
		stream.push(null);
		const chunks = [];
		ffmpeg(stream)
			.toFormat('mp3')
			.on('error', err => reject(err))
			.on('end', () => {
				resolve(Buffer.concat(chunks));
			})
			.pipe()
			.on('data', chunk => chunks.push(chunk));
	});
};

const getContentBuffer = async content => {
	if (Buffer.isBuffer(content)) return content;
	if (typeof content === 'string' && content.startsWith('http')) {
		return await buffer(content);
	}
	return Buffer.from(content);
};

const ensureBuffer = async input => {
	const buffer = await getContentBuffer(input);
	if (!Buffer.isBuffer(buffer)) {
		throw new Error('Failed to convert content to a valid buffer.');
	}
	return buffer;
};

const detectMimeType = async buffer => {
	if (typeof buffer === 'string') {
		return 'text/plain';
	}
	try {
		const fileType = await fileTypeFromBuffer(buffer);
		return fileType ? fileType.mime : 'application/octet-stream';
	} catch {
		return 'application/octet-stream';
	}
};

export { createInteractiveMessage, FiletypeFromUrl, getBuffer, extractUrlFromMessage, decodeJid, parseJid, parsedJid, getJson, postJson, isUrl, getUrl, formatBytes, clockString, runtime, getFloor, getRandom, sleep, getQueryParams, mergeObjects, numberToJID, formatDate, generateUUID, buffer, toAudio, ensureBuffer, detectMimeType, getContentBuffer };
