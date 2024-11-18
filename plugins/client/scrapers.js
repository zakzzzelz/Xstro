import axios from 'axios';
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

export async function FilpMedia(buffer, direction) {
	const { ext, mime } = await fileTypeFromBuffer(buffer);
	if (!ext) return;
	const form = new FormData();
	form.append('media', buffer, { filename: `media.${ext}`, contentType: mime });
	const res = await axios.post(`https://server-di1w.onrender.com/api/flip?direction=${direction}`, form, {
		headers: form.getHeaders(),
		responseType: 'arraybuffer',
	});
	return res.data;
}

export async function toSticker(buffer) {
	const media = await upload(buffer);
	const res = await getBuffer(`https://bk9.fun/maker/sticker?url=${media.url}&packName=${config.STICKER_PACK.split(';')[0]}&authorName=${config.STICKER_PACK.split(';')[1]}`);
	return res;
}

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
