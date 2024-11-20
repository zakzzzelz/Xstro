import axios from 'axios';
import FormData from 'form-data';
import { getBuffer, getJson, getRandom } from '../../lib/utils.js';
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
	const res = await getJson(`https://bk9.fun/tools/shortlink?url=${encodeURIComponent(url)}`);
	return res.BK9;
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

export async function Tiktok(url) {
	const res = await getJson(`https://bk9.fun/download/tiktok?url=${encodeURIComponent(url)}`);
	const { BK9, desc } = res.BK9;
	const buffer = await getBuffer(BK9);
	return { buffer, desc };
}

export async function InstaDL(url) {
	const res = await getJson(`https://bk9.fun/download/instagram2?url=${encodeURIComponent(url)}`);
	const data = getRandom(res.BK9);
	const buffer = await getBuffer(data.url);
	return buffer;
}

export async function YTV(url) {
	const res = await getJson(`https://bk9.fun/download/youtube?url=${encodeURIComponent(url)}`);
	const { title, mediaLink } = res.BK9[0];
	const buffer = await getBuffer(mediaLink);
	return { buffer, title };
}
