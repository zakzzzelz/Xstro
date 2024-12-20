import { getBuffer } from 'xstro-utils';
import config from '#config';

export default class Xstro {
	constructor() {
		this.value = null;
	}

	async filpMedia(url, direction) {
		const res = `https://server-j264.onrender.com/api/flip?url=${encodeURIComponent(url)}&direction=${direction}`;
		return await getBuffer(res);
	}

	async makeSticker(url, pack = config.STICKER_PACK.split(';')[0], author = config.STICKER_PACK.split(';')[1]) {
		const res = `https://server-j264.onrender.com/api/sticker?url=${encodeURIComponent(url)}&packname=${pack}&author=${author}`;
		return await getBuffer(res);
	}

	async blackVideo(url) {
		const res = `https://server-j264.onrender.com/api/blackvideo?url=${encodeURIComponent(url)}`;
		return await getBuffer(res);
	}

	async opus(url) {
		const res = `https://server-j264.onrender.com/api/opus?url=${encodeURIComponent(url)}`;
		return await getBuffer(res);
	}
}
