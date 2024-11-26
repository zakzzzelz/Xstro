import config from '../config.js';
import { bot } from '../lib/handler.js';
import { setAnti } from '../lib/sql/antidel.js';
import { disableAntiVV, enableAntiVV, getStatus } from '../lib/sql/antivv.js';
import { extractUrlFromMessage, getBuffer, getJson } from '../lib/utils.js';
import { remini } from './client/scrapers.js';

const { API_KEY } = config
const base_url = `https://api.giftedtech.my.id/api/tools/`

bot(
	{
		pattern: 'antidel',
		isPublic: false,
		desc: 'Configure AntiDelete',
		type: 'misc',
	},
	async (message, match, m, { prefix, pushName }) => {
		if (!m.isGroup) return message.sendReply('_For groups only!_');
		if (!match) return message.sendReply(`_${pushName} Wrong Usage!_\n${prefix}antidel on | off`);

		const chatId = m.from;
		const status = match.toLowerCase() === 'on';

		const setStatus = await setAnti(chatId, status);
		if (setStatus) {
			return message.sendReply(`_Anti-delete has been turned ${status ? 'on' : 'off'}._`);
		} else {
			return message.sendReply('_Failed to update anti-delete status. Please try again._');
		}
	},
);

bot(
	{
		pattern: 'antivv',
		isPublic: false,
		desc: 'Configure AntiViewonce',
		type: 'misc',
	},
	async (message, match) => {
		const args = match?.trim()?.toLowerCase();
		if (!args) {
			const status = await getStatus();
			if (!status) return await message.sendReply('_Anti-ViewOnce is currently disabled._');
			return await message.sendReply(`_Anti-ViewOnce is enabled for: ${status === 'all' ? 'all chats' : status === 'dm' ? 'direct messages' : 'group chats'}._`);
		}
		if (['all', 'dm', 'gc'].includes(args)) {
			await enableAntiVV(args);
			return await message.sendReply(`_Anti-ViewOnce enabled for ${args === 'all' ? 'all chats' : args === 'dm' ? 'direct messages' : 'group chats'}._`);
		}
		if (args === 'disable') {
			await disableAntiVV();
			return await message.sendReply('_Anti-ViewOnce has been disabled._');
		}
		return await message.sendReply('_Use:\n- `antivv all` to enable for all chats\n- `antivv dm` to enable for direct messages\n- `antivv gc` to enable for group chats\n- `antivv disable` to disable Anti-ViewOnce._');
	},
);

bot(
	{
		pattern: 'upscale',
		isPublic: true,
		desc: 'Upscale an Image',
		type: 'misc'
	},
	async (message) => {
		if (!message.reply_message?.image) return message.sendReply('_Reply An Image Only!_')
		const media = await message.download()
		const buff = await remini(media, 'enhance')
		return await message.send(buff)

	}
)

bot(
	{
		pattern: 'recolor',
		isPublic: true,
		desc: 'Recolors dead Image',
		type: 'misc'
	},
	async (message) => {
		if (!message.reply_message?.image) return message.sendReply('_Reply An Image Only!_')
		const media = await message.download()
		const buff = await remini(media, 'recolor')
		return await message.send(buff)
	}
)

bot(
	{
		pattern: 'dehaze',
		isPublic: true,
		desc: 'Dehazes an Image',
		type: 'misc'
	},
	async (message) => {
		if (!message.reply_message?.image) return message.sendReply('_Reply An Image Only!_')
		const media = await message.download()
		const buff = await remini(media, 'dehaze')
		return await message.send(buff)
	}
)

bot(
	{
		pattern: 'define',
		isPublic: true,
		desc: 'Get definitions for a given term',
		type: 'misc'
	},
	async (message, match) => {
		const term = match.trim();
		if (!term) return await message.sendReply("Please provide a term to define.");

		const apiUrl = `${base_url}define?apikey=${API_KEY}&term=${encodeURIComponent(term)}`;
		const res = await getJson(apiUrl);

		const definitions = res.results.slice(0, 3).map((def, index) =>
			`*Definition ${index + 1}:*\n${def.definition}\n\n*Example:* ${def.example || "N/A"}\n*Author:* ${def.author}\n*Thumbs Up:* ${def.thumbs_up}, *Thumbs Down:* ${def.thumbs_down}\n[Permalink](${def.permalink})`
		);
		return await message.sendReply(definitions.join("\n\n"));
	}
);

bot(
	{
		pattern: 'ebase',
		isPublic: true,
		desc: 'Fetches ebase details for a query term',
		type: 'misc'
	},
	async (message, match) => {
		const query = match || message.reply_message?.text
		if (!query) return await message.sendReply("Please provide a query term for ebase.");
		const apiUrl = `${base_url}ebase?apikey=${API_KEY}&query=${encodeURIComponent(query)}`;
		const data = await getJson(apiUrl);
		return await message.sendReply(`*Result for Ebase:*\n${data.result}`);

	}
);

bot(
	{
		pattern: 'dbase',
		isPublic: true,
		desc: 'Fetches dbase details for a query term',
		type: 'misc'
	},
	async (message, match) => {
		const query = match || message.reply_message?.text;
		if (!query) return await message.sendReply("Please provide a query term for dbase.");
		const apiUrl = `${base_url}dbase?apikey=${API_KEY}&query=${encodeURIComponent(query)}`;
		const data = await getJson(apiUrl);
		return await message.sendReply(`*Result for Dbase:*\n${data.result}`);
	}
);

bot(
	{
		pattern: 'ssweb',
		isPublic: true,
		desc: 'Screenshot website',
		type: 'misc'
	},
	async (message, match) => {
		const query = match || message.reply_message?.text;
		const url = extractUrlFromMessage(query)
		if (!url) return message.sendReply('```I need url```')
		const apiUrl = `${base_url}sspc?apikey=${API_KEY}&url=${encodeURIComponent(query)}`;
		const data = await getBuffer(apiUrl);
		return await message.send(data);
	}
);