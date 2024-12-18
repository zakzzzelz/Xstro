import fs from 'fs/promises';
import { createReadStream, unlinkSync, writeFileSync } from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';
import config from '../config.js';
import { FileTypeFromBuffer } from 'xstro-utils';

const XSTRO_API = 'https://xstro-pair-9add3cd2fdfd.herokuapp.com';

export async function flipMedia(buffer, direction) {
	const fileType = await FileTypeFromBuffer(buffer);
	if (!fileType) throw new Error('Unsupported file type.');
	const { ext, mime } = fileType;
	const form = new FormData();
	form.append('media', buffer, { filename: `media.${ext}`, contentType: mime });
	const res = await axios.post(`${XSTRO_API}/api/flip?direction=${direction}`, form, {
		headers: form.getHeaders(),
		responseType: 'arraybuffer',
	});
	return res.data;
}

export async function toBlackVideo(buffer, color = 'black') {
	const form = new FormData();
	form.append('audio', buffer, {
		filename: 'input-audio.mp3',
		contentType: 'audio/mpeg',
	});
	form.append('color', color);
	const response = await axios.post(`${XSTRO_API}/api/blackvideo`, form, {
		headers: {
			...form.getHeaders(),
		},
		responseType: 'arraybuffer',
	});

	return Buffer.from(response.data);
}

export async function convertToOpus(buffer) {
	const formData = new FormData();

	formData.append('audio', buffer, {
		filename: 'audio.mp3',
		contentType: 'audio/mpeg',
	});
	const res = await axios.post(`${XSTRO_API}/api/opus`, formData, {
		headers: {
			...formData.getHeaders(),
		},
		responseType: 'arraybuffer',
	});

	return Buffer.from(res.data);
}

const mimeMap = {
	jpg: { mime: 'image/jpeg', ext: 'jpg' },
	jpeg: { mime: 'image/jpeg', ext: 'jpg' },
	png: { mime: 'image/png', ext: 'png' },
	gif: { mime: 'image/gif', ext: 'gif' },
	webp: { mime: 'image/webp', ext: 'webp' },
	mp4: { mime: 'video/mp4', ext: 'mp4' },
	mp3: { mime: 'audio/mpeg', ext: 'mp3' },
};

const getMimeAndExt = fileType => {
	const mapped = mimeMap[fileType];
	if (!mapped) return null;
	return mapped;
};

export const toSticker = async (buffer, packname = config.STICKER_PACK.split(';')[1], author = config.STICKER_PACK.split(';')[0]) => {
	try {
		const fileType = await FileTypeFromBuffer(buffer);
		const fileInfo = getMimeAndExt(fileType);
		if (!fileInfo) throw new Error('Unsupported or unknown file type');
		const { mime } = fileInfo;
		const form = new FormData();
		form.append('media', buffer, { filename: `media.${fileType}`, contentType: mime });
		form.append('packname', packname);
		form.append('author', author);

		const headers = form.getHeaders();
		const res = await axios.post(`${XSTRO_API}/api/sticker`, form, {
			headers: {
				...headers,
			},
			responseType: 'arraybuffer',
		});

		return res.data;
	} catch (error) {
		throw error;
	}
};

export const remini = async (image, filterType) => {
	const availableFilters = ['enhance', 'recolor', 'dehaze'];
	const selectedFilter = availableFilters.includes(filterType) ? filterType : availableFilters[0];

	const form = new FormData();
	const apiUrl = `https://inferenceengine.vyro.ai/${selectedFilter}`;

	form.append('model_version', 1);

	const imageBuffer = Buffer.isBuffer(image) ? image : fs.readFileSync(image);
	form.append('image', imageBuffer, {
		filename: 'enhance_image_body.jpg',
		contentType: 'image/jpeg',
	});

	try {
		const response = await axios.post(apiUrl, form, {
			headers: {
				...form.getHeaders(),
				'User-Agent': 'okhttp/4.9.3',
				Connection: 'Keep-Alive',
				'Accept-Encoding': 'gzip',
			},
			responseType: 'arraybuffer',
		});
		return Buffer.from(response.data);
	} catch (error) {
		throw new Error(`Error enhancing image: ${error.message}`);
	}
};

export const solveMath = expression => {
	if (typeof expression !== 'string') return 'Invalid input: expression must be a string';

	const sanitizedExpression = expression.replace(/[^0-9+\-*/().√^%\s]/g, '').trim();
	if (!sanitizedExpression || sanitizedExpression.length === 0) return 'Empty expression';

	try {
		let processedExpression = sanitizedExpression.replace(/√/g, 'Math.sqrt').replace(/\^/g, '**').replace(/\s+/g, '');
		const safeEval = new Function(`
            "use strict";
            try {
                return String(${processedExpression});
            } catch (error) {
                return 'Evaluation error';
            }
        `);

		const result = safeEval();
		if (result === null || result === undefined) return 'Invalid result';

		if (Number.isNaN(Number(result)) || !Number.isFinite(Number(result))) return 'Mathematical error';

		return String(Number(result).toPrecision(15)).replace(/\.?0+$/, '');
	} catch (error) {
		return 'Invalid expression';
	}
};

export const base64 = str => Buffer.from(str).toString('base64');

export const ebinary = str =>
	str
		.split('')
		.map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
		.join(' ');

export const dbinary = bin =>
	bin
		.split(' ')
		.map(b => String.fromCharCode(parseInt(b, 2)))
		.join('');

export const obfuscate = code => {
	if (typeof code !== 'string') {
		throw new Error('Input must be a string');
	}

	let scrambled = code
		.split('')
		.map(char => {
			const codePoint = char.codePointAt(0);
			return String.fromCodePoint(codePoint + 5);
		})
		.join('');
	return btoa(scrambled).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

export const deobfuscate = encoded => {
	if (typeof encoded !== 'string') throw new Error('Input must be a string');

	let base64 = encoded
		.replace(/-/g, '+')
		.replace(/_/g, '/')
		.padEnd(encoded.length + ((4 - (encoded.length % 4)) % 4), '=');

	let decoded = atob(base64);

	return decoded
		.split('')
		.map(char => {
			const codePoint = char.codePointAt(0);
			return String.fromCodePoint(codePoint - 5);
		})
		.join('');
};

export const toAscii = str =>
	str
		.split('')
		.map(char => char.charCodeAt(0))
		.join(' ');

export const generatePdf = async text => {
	const res = await axios.post(
		`${XSTRO_API}/api/topdf`,
		{ text },
		{
			responseType: 'arraybuffer',
		},
	);
	return res.data;
};

export const uploadFile = async mediaBuffer => {
	const fileType = await FileTypeFromBuffer(mediaBuffer);
	if (!fileType) throw new Error('Unable to determine the file type of the media.');
	const filename = `file.${fileType}`;
	const temp = path.join(process.cwd(), filename);
	writeFileSync(temp, mediaBuffer);
	const form = new FormData();
	form.append('fileToUpload', createReadStream(temp), {
		filename: filename,
		contentType: fileType,
	});
	form.append('reqtype', 'fileupload');
	const response = await axios.post('https://catbox.moe/user/api.php', form, {
		headers: form.getHeaders(),
	});
	const url = response.data.trim();
	unlinkSync(temp);
	return url;
};

/**
 * Converts a WebP sticker buffer to a JPG photo buffer.
 * @param {Buffer} webpBuffer - The buffer of the WebP sticker file.
 * @returns {Promise<Buffer>} - A promise that resolves with the converted JPG buffer.
 */
export const StickerToPhoto = async webpBuffer => {
	try {
		// Create a new FormData instance
		const formData = new FormData();
		formData.append('image', webpBuffer, {
			contentType: 'image/webp', // Ensure correct content type
		});

		// Send the POST request to the API endpoint
		const response = await axios.post('http://localhost:3000/api/photo', formData, {
			headers: {
				...formData.getHeaders(), // Include the form data headers
				'Content-Type': 'multipart/form-data', // Explicitly set the content type
			},
		});

		return response.data; // Return the converted JPG buffer
	} catch (error) {
		console.error('Error converting sticker to photo:', error.message);
		throw error; // Re-throw the error to be handled by the caller
	}
};
