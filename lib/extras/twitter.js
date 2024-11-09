import { getBuffer, getJson } from '../utils.js';

export async function twitter(url) {
	if (!url) throw new Error('No Url Found!');
	const API_URL = `https://bk9.fun/download/twitter?url=${url}`;
	const res = await getJson(API_URL);
	const { HD, caption } = res.BK9;
	const buffer = await getBuffer(HD);
	return { buffer, caption };
}
