import { bot } from '../lib/client/plugins.js';
import { ChatBot } from '../lib/sql/lydia.js';
import { numtoId } from '../lib/utils.js';
import axios from 'axios';

export const upsertChatBot = async (chat, type, enabled) => {
	await ChatBot.upsert({ chat, type, enabled });
};

export const isChatBotEnabled = async chat => {
	const chatbot = await ChatBot.findOne({ where: { chat } });
	if (chatbot) return chatbot.enabled;
	const globalChatbot = await ChatBot.findOne({ where: { chat: 'all' } });
	return globalChatbot ? globalChatbot.enabled : false;
};

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
			await upsertChatBot('all', 'all', true);
			return await message.sendReply('_Lydia Activated for all Chats!_');
		}
		if (command === 'off') {
			await upsertChatBot('all', 'all', false);
			return await message.sendReply('_Lydia Disabled!_');
		}
		if (command.startsWith('set')) {
			const [, setting] = command.split(' ');
			if (!setting) return await message.sendReply('_Wrong Configuration!_');
			if (setting === 'gc') {
				await upsertChatBot('groups', 'gc', true);
				return await message.sendReply('_Lydia Enabled For Groups Only!_');
			}
			if (setting.startsWith('dm;')) {
				const number = setting.split(';')[1];
				if (!number) return await message.sendReply('_Provide number!_');
				const jid = numtoId(number);
				await upsertChatBot(jid, 'dm', true);
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
		const chatEnabled = await isChatBotEnabled(message.jid);
		if (chatEnabled) {
			const userID = message.sender;
			const question = message.text;
			const aiResponse = await chatAi(userID, question);
			await message.sendReply(aiResponse);
		}
	},
);

const cache = new Map();

export async function chatAi(userID, question) {
	const cacheKey = `${userID}:${question}`;
	if (cache.has(cacheKey)) return cache.get(cacheKey);
	try {
		const res = await axios.get(`http://api.brainshop.ai/get?bid=175685&key=Pg8Wu8mrDQjfr0uv&uid=${userID}&msg=${question}`);
		const result = res.data.cnt;
		cache.set(cacheKey, result);
		return result;
	} catch {}
}
