import config from '#config';
import { getBuffer, getJson } from 'xstro-utils';

const { API_ID } = config;

const XSTRO = {
	facebook: async url => {
		const res = await getJson(
			`${API_ID}/api/facebook?url=${encodeURIComponent(url)}`,
		);
		return res.url;
	},
	instagram: async url => {
		const res = await fetch(`${API_ID}/api/instagram?url=${url}`);
		const json = await res.json();
		const bufferRes = await fetch(json.url);
		const data = await bufferRes.arrayBuffer();
		const dataBuffer = Buffer.from(data);
		return dataBuffer;
	},
	twitter: async url => {
		const res = await getJson(`${API_ID}/api/twitter?url=${url}`);
		return await getBuffer(res.url);
	},
	youtube: async (url, type = {}) => {
		if (type.mp4) {
			const res = `${API_ID}/api/ytmp4?url=${url}`;
			const data = await getJson(res);
			return {
				title: data.title,
				thumb: data.thumbnail,
				url: data.url,
			};
		} else if (type.mp3) {
			const res = await getJson(`${API_ID}/api/ytmp3?url=${url}`);
			return {
				title: res.title,
				thumb: res.thumbnail,
				url: res.link,
			};
		}
	},
	tiktok: async url => {
		const res = `${API_ID}/api/tiktok?url=${url}`;
		const data = await getJson(res);
		return {
			title: data.title,
			url: data.url,
		};
	},
	chatbot: async text => {
		const res = `${API_ID}/api/hericai?query=${text}`;
		return await getJson(res.answer);
	},
	facts: async () => {
		const res = `${API_ID}/api/facts`;
		const data = await getJson(res);
		return data.fact;
	},
	quotes: async () => {
		const res = `${API_ID}/api/quotes`;
		const data = (await getJson(res)).quote;
		return `Quote: ${data.quote}\n\nAuthor: ${data.author}`;
	},
	advice: async () => {
		const res = `${API_ID}/api/advice`;
		const data = await getJson(res);
		return data.advice;
	},
	rizz: async () => {
		const res = `${API_ID}/api/rizz`;
		const data = await getJson(res);
		return data.text;
	},
	bible: async verse => {
		const res = `${API_ID}/api/bible?verse=${verse}`;
		const data = await getJson(res);
		return data.text;
	},
	fancy: async text => {
		const res = await getJson(`${API_ID}/api/fancy?text=${text}`);
		return res.result;
	},
	short: async url => {
		const res = await getJson(`${API_ID}/api/tinyurl?url=${url}`);
		return res.result;
	},
	generatePdf: async content => {
		const res = `${API_ID}/api/getpdf?content=${content}`;
		return await getBuffer(res);
	},
	maths: async expression => {
		const res = await getJson(`${API_ID}/api/solveMath?expression=${expression}`);
		return res.result;
	},
	searchSticker: async query => {
		const res = await getJson(`${API_ID}/api/ssticker?query=${query}`);
		return res.sticker;
	},
	obfuscate: async code => {
		const res = await getJson(`${API_ID}/api/obfuscate?code=${code}`);
		return res.result;
	},
	ttp: async text => {
		const res = await getJson(`${API_ID}/api/ttp?text=${text}`);
		return await getBuffer(res[0].url);
	},
	gitstalk: async username => {
		const res = await getJson(`${API_ID}/api/gitstalk?username=${username}`);
		return res;
	},
};

export { XSTRO };
export default XSTRO;
