import { getBuffer } from 'xstro-utils';
import config from '#config';

export default class Xstro {
	constructor() {
		this.value = null;
		this.url = 'https://xstro-pair-9add3cd2fdfd.herokuapp.com/api';
	}

	async filpMedia(url, direction) {
		return await getBuffer(`${this.url}/flip?url=${encodeURIComponent(url)}&direction=${direction}`);
	}

	async makeSticker(url, pack = config.STICKER_PACK.split(';')[0], author = config.STICKER_PACK.split(';')[1]) {
		return await getBuffer(`${this.url}/sticker?url=${encodeURIComponent(url)}&packname=${pack}&author=${author}`);
	}

	async blackVideo(url) {
		return await getBuffer(`${this.url}/blackvideo?url=${encodeURIComponent(url)}`);
	}

	async opus(url) {
		return await getBuffer(`${this.url}/opus?url=${encodeURIComponent(url)}`);
	}
}
