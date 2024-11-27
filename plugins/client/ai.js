import config from '../../config.js';
import { getBuffer, getJson } from '../../lib/utils.js';

const AI_API = 'https://api.giftedtech.my.id/api/ai/';

const errorMessage = {
	default: '_Unable to process your Request_',
	image: '_Unable to Generate Images try again later_',
};

export async function Gemini(question) {
	if (!question) return '_How Can I help You Today?_';

	const response = await getJson(`${AI_API}geminiaipro?apikey=${config.API_KEY}&q=${question}`);
	return response.result || errorMessage.default;
}

export async function GPT4(query) {
	if (!query) return '_How can I assist you today?_';

	const response = await getJson(`${AI_API}gpt4-o?apikey=${config.API_KEY}&q=${query}`);
	return response.result || errorMessage.default;
}

export async function Llama(query) {
	if (!query) return '_How can I assist you today?_';

	const response = await getJson(`${AI_API}llamaai?apikey=${config.API_KEY}&q=${query}`);
	return response.result || errorMessage.default;
}

export async function DiffuseAI(prompt) {
	if (!prompt) return '_Give me a word to generate images from_';

	const response = await getBuffer(`${AI_API}sd?apikey=${config.API_KEY}&prompt=${prompt}`);
	return response || errorMessage.image;
}

export async function Text2Img(prompt) {
	if (!prompt) return '_Give me a description to generate an image_';

	const response = await getBuffer(`${AI_API}text2img?apikey=${config.API_KEY}&prompt=${encodeURIComponent(prompt)}`);
	return response || errorMessage.image;
}