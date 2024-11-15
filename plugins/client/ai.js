import { getJson } from '../../lib/utils.js';

export async function Gemini(prompt = 'What Model are you?') {
	const res = await getJson(`https://api.giftedtech.my.id/api/ai/geminiaipro?apikey=gifted&q=${prompt}`);
	return res.result;
}

export async function chatAi(userID, question) {
	const res = await getJson(`http://api.brainshop.ai/get?bid=175685&key=Pg8Wu8mrDQjfr0uv&uid=${userID}&msg=${question}`)
	return res.cnt
}
