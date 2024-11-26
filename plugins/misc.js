import { bot } from '../lib/handler.js';
import { setAnti } from '../lib/sql/antidel.js';
import { disableAntiVV, enableAntiVV, getStatus } from '../lib/sql/antivv.js';
import { remini } from './client/scrapers.js';

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
		if (!message.quoted?.image) return message.sendReply('_Reply An Image Only!_')
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
		if (!message.quoted?.image) return message.sendReply('_Reply An Image Only!_')
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
		if (!message.quoted?.image) return message.sendReply('_Reply An Image Only!_')
		const media = await message.download()
		const buff = await remini(media, 'dehaze')
		return await message.send(buff)
	}
)