import { bot } from '../lib/client/plugins.js';
import { ChatBot } from '../lib/sql/lydia.js';
import { numtoId } from '../lib/utils.js';
import { chatAi, Gemini } from './client/ai.js';

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

bot(
	{
		pattern: 'lydia',
		isPublic: false,
		desc: 'Chat Bot',
		type: 'ai',
	},
	async (message, match, { prefix, pushName }) => {
		if (!match) {
			return await message.sendReply(
				`*_ChatBot Usage_*
• ${prefix}lydia on - Enable chatbot for everyone
• ${prefix}lydia off - Disable chatbot
• ${prefix}lydia set dm;2348030000005 - Enable for specific DM
• ${prefix}lydia set gc - Enable only in groups`,
			);
		}

		const command = match.toLowerCase().trim();
		if (command === 'on') {
			await ChatBot.upsert({ chat: 'all', type: 'all', enabled: true });
			return await message.sendReply('_Lydia Activated for all Chats!_');
		}
		if (command === 'off') {
			await ChatBot.upsert({ chat: 'all', type: 'all', enabled: false });
			return await message.sendReply('_Lydia Disabled!_');
		}
		if (command.startsWith('set')) {
			const [, setting] = command.split(' ');
			if (!setting) return await message.sendReply('_Wrong Configuration!_');
			if (setting === 'gc') {
				await ChatBot.upsert({ chat: 'groups', type: 'gc', enabled: true });
				return await message.sendReply('_Lydia Enabled For Groups Only!_');
			}
			if (setting.startsWith('dm;')) {
				const number = setting.split(';')[1];
				if (!number) return await message.sendReply('_provide number!_');
				const jid = numtoId(number);
				await ChatBot.upsert({ chat: jid, type: 'dm', enabled: true });
				return await message.sendReply(`_Lydia Set For @${number}_`, { mentions: [numtoId(number)] });
			}
		}
		return await message.sendReply(`_${pushName} bro you are not getting it right_`);
	},
);

bot(
	{
		on: 'text',
		dontAddCommandList: true,
		isPublic: true,
	},
	async message => {
		const chatEnabled = await ChatBot.isEnabled(message.jid);
		if (chatEnabled) {
			const userID = message.sender;
			const question = message.text;
			const aiResponse = await chatAi(userID, question);
			await message.sendReply(aiResponse);
		}
	},
);
