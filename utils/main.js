import { performance } from 'perf_hooks';
import { promises as fs } from 'fs';
import { join } from 'path';
import { getContentType, jidNormalizedUser, normalizeMessageContent } from 'baileys';
import { loadMessage } from '#sql';
import { FileTypeFromBuffer, getBuffer } from 'xstro-utils';
import { getConfigValues } from '#lib';

export function manageProcess(type) {
	if (type === 'restart') {
		process.exit();
	} else if (type === 'stop') {
		process.send('app.kill');
	}
}

export function formatBytes(bytes, decimals = 2) {
	if (!+bytes) return '0 Bytes';
	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function runtime(seconds) {
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
}

export const getFloor = number => {
	return Math.floor(number);
};

export const getRandom = array => {
	if (array.length === 0) return undefined;
	const randomIndex = Math.floor(Math.random() * array.length);
	return array[randomIndex];
};

export const toJid = num => {
	if (!num || typeof num !== 'string') num = num.toString();
	num = num.replace(/:\d+/, '');
	num = num.replace(/\D/g, '');
	return jidNormalizedUser(`${num}@s.whatsapp.net`);
};

export const bufferToJSON = obj => {
	if (Buffer.isBuffer(obj)) return { type: 'Buffer', data: Array.from(obj) };
	if (Array.isArray(obj)) return obj.map(bufferToJSON);
	if (obj && typeof obj === 'object') {
		return Object.fromEntries(
			Object.entries(obj).map(([key, value]) => [key, bufferToJSON(value)])
		);
	}
	return obj;
};

export const jsonToBuffer = obj => {
	if (obj?.type === 'Buffer' && Array.isArray(obj.data)) return Buffer.from(obj.data);
	if (Array.isArray(obj)) return obj.map(jsonToBuffer);
	if (obj && typeof obj === 'object') {
		return Object.fromEntries(
			Object.entries(obj).map(([key, value]) => [key, jsonToBuffer(value)])
		);
	}
	return obj;
};

export const profile = async (name, fn, logger) => {
	const start = performance.now();
	const result = await fn();
	const end = performance.now();
	logger.debug(`${name} took ${(end - start).toFixed(2)} ms`);
	return result;
};

const proxyFilePath = join('./utils/proxy.txt');
export const getRandomProxy = async () => {
	try {
		const data = await fs.readFile(proxyFilePath, 'utf8');
		const proxies = data.split('\n').filter(line => line.trim() !== '');
		if (proxies.length === 0) return null;
		const randomIndex = Math.floor(Math.random() * proxies.length);
		return proxies[randomIndex];
	} catch (error) {
		console.error('Error reading proxy file:', error);
		return null;
	}
};

export function isJSON(input) {
	if (typeof input !== 'string') return false;

	try {
		const parsed = JSON.parse(input);
		return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed);
	} catch (error) {
		return false;
	}
}

export function isObject(value) {
	return value !== null && typeof value === 'object';
}

export function isArray(value) {
	return Array.isArray(value);
}

export function cleanString(inputText) {
	const ambiguousCharacters = /[^\w\s.,!?'"()\-]/g;
	const cleanedText = inputText.replace(ambiguousCharacters, '').replace(/\s+/g, ' ').trim();
	return cleanedText;
}

export async function ModifyViewOnceMessage(messageId) {
	try {
		const msg = await loadMessage(messageId);
		const type = getContentType(msg.message.message);
		const content = normalizeMessageContent(
			msg.message.message?.[type]?.contextInfo?.quotedMessage
		);

		function modifyViewOnceProperty(obj) {
			if (typeof obj !== 'object' || obj === null) return;

			for (const key in obj) {
				if (key === 'viewOnce' && typeof obj[key] === 'boolean') {
					obj[key] = false;
				} else if (typeof obj[key] === 'object') {
					modifyViewOnceProperty(obj[key]);
				}
			}
		}

		modifyViewOnceProperty(content);

		return { message: content };
	} catch {
		return null;
	}
}

/**
 * Saves a buffer to a file in the current working directory and returns the file path.
 *
 * @param {Buffer} buffer - The buffer to save.
 * @returns {Promise<string>} - The full path of the saved file.
 */
export const bufferFile = async buffer => {
	const ext = await FileTypeFromBuffer(buffer);
	const fileName = `${Date.now()}.${ext}`;
	const filePath = join(process.cwd(), fileName);
	await fs.writeFile(filePath, buffer);
	return filePath;
};

export async function convertNormalMessageToViewOnce(message = {}) {
	const typeOfMessage = getContentType(message);
	const objectAction = message?.[typeOfMessage];

	if (objectAction) {
		const newMessage = {
			[typeOfMessage]: {
				...objectAction,
				viewOnce: true
			}
		};
		if (message.messageContextInfo) newMessage.messageContextInfo = message.messageContextInfo;
		return newMessage;
	}

	return message;
}

export async function ensureContextInfoWithMentionedJid(message = {}, mentionedJidParam = []) {
	const typeOfMessage = getContentType(message);
	const objectAction = message?.[typeOfMessage];

	if (objectAction) {
		const newMessage = {
			[typeOfMessage]: {
				...objectAction,
				contextInfo: {
					...objectAction.contextInfo,
					mentionedJid: objectAction.contextInfo?.mentionedJid || mentionedJidParam
				}
			}
		};
		if (typeOfMessage === 'conversation' && typeof objectAction === 'string') {
			newMessage[typeOfMessage] = objectAction;  // Restore it to a string format
		}

		return newMessage;
	}

	return message;
}


export async function getFileAndSave(url) {
	let attempts = 0;
	let data;

	while (attempts < 3) {
		try {
			data = await getBuffer(url);
			data = await bufferFile(data);
			return data;
		} catch {
			return false;
		}
	}
}

export const isPrefix = async userInput => {
	const configValues = await getConfigValues();
	const prefix = configValues.PREFIX || ',./^!#&$%';
	const prefixRegex = new RegExp(
		`^(${prefix
			.split('')
			.map(char => `\\${char}`)
			.join('|')})$`
	);
	return !prefix || prefixRegex.test(userInput);
};

export const extractUrl = str => {
	const match = str.match(/https?:\/\/[^\s]+/);
	return match ? match[0] : false;
};

export const isfacebook = url => /^(https?:\/\/)?(www\.)?facebook\.com\/[A-Za-z0-9._-]+/.test(url);
export const isInsta = url => /^(https?:\/\/)?(www\.)?instagram\.com\/[A-Za-z0-9._-]+/.test(url);
export const isReddit = url => /^https?:\/\/(www\.)?reddit\.com\/[^\s]*$/.test(url);
export const isTikTok = url => /^https?:\/\/(www\.)?tiktok\.com\/[^\s]*$/.test(url);
export const isRumble = url => /^https?:\/\/(www\.)?rumble\.com\/[^\s]*$/.test(url);
export function toTwitter(url) {
	if (typeof url !== 'string') return null;
	const regex = /^https?:\/\/x\.com\/(.+)/;
	const match = url.match(regex);
	if (match && match[1]) return `https://twitter.com/${match[1]}`;

	return false;
}
export function isUrl(string) {
	if (typeof string !== 'string') return false;

	try {
		const url = new URL(string);
		return url.protocol === 'http:' || url.protocol === 'https:';
	} catch (error) {
		return false; // Invalid URL
	}
}
