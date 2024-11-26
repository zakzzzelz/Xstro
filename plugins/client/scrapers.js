import fs from 'fs'
import axios from 'axios';
import FormData from 'form-data';
import { getBuffer, getJson } from '../../lib/utils.js';
import config from '../../config.js';
import { fileTypeFromBuffer } from 'file-type';

export async function twitter(url) {
	if (!url || !url.includes('x.com')) throw new Error('_Invaild Url_');
	const API_URL = `https://bk9.fun/download/twitter?url=${url}`;
	const res = await getJson(API_URL);
	const { HD, caption } = res.BK9;
	const buffer = await getBuffer(HD);
	return { buffer, caption };
}

export async function textToPDF(text) {
	if (!text) return `_No Text Found!_`;
	const doc = await getBuffer(`https://bk9.fun/tools/pdf?q=${text}`);
	return doc;
}

export async function shortUrl(url) {
	const res = await getJson(`${config.BASE_API_URL}/api/shorten?url=${url}`)
	return res.link
}

export async function TTS(text) {
	const res = await getBuffer(`https://bk9.fun/tools/tts?q=${text}&lang=en`);
	return res;
}

export async function flipMedia(buffer, direction) {
	const fileType = await fileTypeFromBuffer(buffer);
	if (!fileType) throw new Error('Unsupported file type.');
	const { ext, mime } = fileType;
	const form = new FormData();
	form.append('media', buffer, { filename: `media.${ext}`, contentType: mime });
	const res = await axios.post(`${config.BASE_API_URL}/api/flip?direction=${direction}`, form, {
		headers: form.getHeaders(),
		responseType: 'arraybuffer',
	});
	return res.data;
}

export async function uploadMedia(buffer) {
	const form = new FormData();
	form.append('media', buffer, { filename: 'media' });

	try {
		const response = await axios.post(`${config.BASE_API_URL}/api/upload`, form, {
			headers: form.getHeaders(),
		});
		return response.data.url;
	} catch (error) {
		console.error('Error:', error.message);
		return null;
	}
}

export async function toBlackVideo(buffer, color = 'black') {
	const form = new FormData();
	form.append('audio', buffer, {
		filename: 'input-audio.mp3',
		contentType: 'audio/mpeg',
	});
	form.append('color', color);
	const response = await axios.post(`${config.BASE_API_URL}/api/blackvideo`, form, {
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

	const response = await fetch(config.BASE_API_URL, {
		method: 'POST',
		body: formData,
		headers: formData.getHeaders(),
	});

	if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
	return Buffer.from(await response.arrayBuffer());
}

export const toSticker = async (buffer, packname = config.STICKER_PACK.split(';')[1], author = config.STICKER_PACK.split(';')[0]) => {
	const fileType = await fileTypeFromBuffer(buffer);
	if (!fileType) throw new Error('Unsupported or unknown file type');
	const { mime, ext } = fileType;
	const form = new FormData();
	form.append('media', buffer, { filename: `media.${ext}`, contentType: mime });
	form.append('packname', packname);
	form.append('author', author);

	const res = await axios.post(`${config.BASE_API_URL}/api/sticker`, form, {
		headers: form.getHeaders(),
		responseType: 'arraybuffer',
	});
	return res.data;
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
