import { getJson } from '../../lib/utils.js';

export async function Gemini(prompt = 'What Model are you?') {
	const res = await getJson(`https://api.giftedtech.my.id/api/ai/geminiaipro?apikey=gifted&q=${prompt}`);
	return res.result;
}
