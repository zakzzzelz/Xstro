import { bot } from '#lib';
import { XSTRO } from '#utils';
import { getJson } from 'xstro-utils';

bot(
	{
		pattern: 'ai',
		public: true,
		desc: 'Chat with an AI Bot',
		type: 'ai',
	},
	async (message, match) => {
		const msg = await message.send('*Thinking*');
		const res = await XSTRO.chatbot(match || message.reply_message.text);
		return await msg.edit(res);
	},
);

bot(
	{
		pattern: 'llama',
		public: true,
		desc: 'Chat with llama',
		type: 'ai',
	},
	async (message, match) => {
		if (!match) return message.send('_How can i help?_');
		const msg = await message.send('*hmm*');
		const res = (
			await getJson(
				`https://api.gurusensei.workers.dev/llama?prompt=${match}`,
			)
		).response.response;
		return await msg.edit(res);
	},
);
