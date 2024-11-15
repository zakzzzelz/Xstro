import { bot } from '../lib/client/plugins.js';
import { Gemini } from '../lib/extras/ai.js';

bot(
	{
		pattern: 'gemini ?(.*)',
		isPublic: true,
		desc: 'Chat with Gemini Ai',
		type: 'ai',
	},
	async (message, match, { pushName }) => {
		const prompt = match || message.quoted?.text;
		if (!prompt) return await message.sendReply(`*_${pushName} hello how can i help you today_*`);
		const msg = await message.sendReply('🤔 _Thinking_');
		const res = await Gemini(prompt);
		return await msg.edit(res);
	},
);
