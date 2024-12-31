import { bot } from '#lib';
import { upload, XSTRO } from '#utils';
import { getBuffer, getJson } from 'xstro-utils';

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
		if (!match && !message.reply_message?.text) return message.send('_How can i help?_');
		const msg = await message.send('*hmm*');
		const res = (await getJson(`https://api.gurusensei.workers.dev/llama?prompt=${match}`)).response.response;
		return await msg.edit(res);
	},
);

bot(
	{
		pattern: 'genimg',
		public: true,
		desc: 'Generate Images with Ai',
		type: 'ai',
	},
	async (message, match) => {
		if (!match) return message.send('_Give me a prompt!_');
		const res = await getBuffer(`https://api.gurusensei.workers.dev/dream?prompt=${match}`);
		return await message.send(res, {
			caption: `_Here is your image for:_ ${match}`,
		});
	},
);

bot(
	{
		pattern: 'gemini',
		public: true,
		desc: 'Chat with Gemini Ai',
		type: 'ai',
	},
	async (message, match) => {
		if (!match && !message.reply_message?.text) return message.send('_How can i help?_');
		const que = match || message.reply_message.text;
		const msg = await message.send('*Thinkg*');
		const res = await getJson(`https://bk9.fun/ai/gemini?q=${que}`).BK9;
		return msg.edit(res);
	},
);

bot(
	{
		pattern: 'askimg',
		public: true,
		desc: 'Ask Ai about an image',
		type: 'ai',
	},
	async (message, match) => {
		if (!match || !message.reply_message.image) return message.send('_Reply An Image and ask me questions about it_');
		const image = await message.download();
		const { rawUrl } = await upload(image);
		const res = (await getJson(`https://bk9.fun/ai/geminiimg?url=${rawUrl}&q=${match}`)).BK9;
		return message.send(res);
	},
);

bot(
	{
		pattern: 'dalle',
		public: true,
		desc: 'Generates Images',
		type: 'ai',
	},
	async (message, match) => {
		if (!match) return message.send('_Give me a prompt!_');
		const res = await getBuffer(`https://bk9.fun/ai/magicstudio?prompt=${match}`);
		return await message.send(res, {
			caption: `_Here is your image for:_ ${match}`,
		});
	},
);
