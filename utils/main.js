import { performance } from 'perf_hooks';
import { jidNormalizedUser } from 'baileys';
import { join } from 'path';

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
		return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, bufferToJSON(value)]));
	}
	return obj;
};

export const jsonToBuffer = obj => {
	if (obj?.type === 'Buffer' && Array.isArray(obj.data)) return Buffer.from(obj.data);
	if (Array.isArray(obj)) return obj.map(jsonToBuffer);
	if (obj && typeof obj === 'object') {
		return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, jsonToBuffer(value)]));
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

const proxyFilePath = join('proxy.txt');
export const getRandomProxy = async () => {
	try {
		const data = await fs.promises.readFile(proxyFilePath, 'utf8');
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
