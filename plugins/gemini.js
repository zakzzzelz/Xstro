import { bot } from '../lib/client/plugins.js';
import { Gemini } from '../lib/extras/ai.js';

bot(
	{
		pattern: 'gemini ?(.*)',
		isPublic: true,
		desc: 'Chat with Gemini Ai',
		type: 'ai',
	},
	async (message, match) => {
		const prompt = match || message.quoted?.text;
		if (!prompt) return await message.sendReply(`_@${message.sender.split('@')[0]} hello how can i help you?_`, { mentions: [message.sender] });
		const msg = await message.sendReply('🤔 _Thinking_');
		const res = await Gemini(prompt);
		return await msg.edit(res);
	},
);
