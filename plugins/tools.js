import config from '../config.js';
import { utils } from '../lib/utils.js';
import { bot } from '../lib/plugins.js';
import { base64, dbinary, deobfuscate, ebinary, obfuscate, solveMath, toAscii } from './bot/tools.js';
import { getBuffer, getJson } from 'utils';



bot(
	{
		pattern: 'getpp',
		isPublic: true,
		desc: 'Get Another Person Profile Image',
		type: 'utils',
	},
	async message => {
		if (message.isGroup) {
			const user = message.reply_message?.sender || message.mention[0];
			if (!user) return message.send('_Reply Or Tag Someone_');
			try {
				const pp = await message.client.profilePictureUrl(user, 'image');
				const res = await getBuffer(pp);
				await message.send(res);
			} catch {
				message.send('_No Profile Photo_');
			}
		} else {
			try {
				const pp = await message.client.profilePictureUrl(message.jid, 'image');
				const res = await getBuffer(pp);
				await message.send(res);
			} catch {
				message.send('_No Profile Photo_');
			}
		}
	},
);

bot(
	{
		pattern: 'surl',
		isPublic: true,
		desc: 'Shorterns A Url',
		type: 'utils',
	},
	async (message, match) => {
		const url = utils.extractUrlFromString(match || message.reply_message?.text);
		if (!url) return message.send('_No Url found_');
		const msg = await message.send('*wait*');
		const res = await getJson(`${config.BASE_API_URL}/api/shorten?url=${url}`);
		return await msg.edit(res.link);
	},
);

bot(
	{
		pattern: 'calc',
		isPublic: true,
		desc: 'Solves Math Equation',
		type: 'utils',
	},
	async (message, match) => {
		if (!match) return message.send('_Provide A Maths Expression_');
		const result = solveMath(match);
		return message.send(result);
	},
);

bot(
	{
		pattern: 'base64',
		isPublic: true,
		desc: 'Encodes text to Base64',
		type: 'utils',
	},
	async (message, match) => {
		if (!match) return message.send('_Provide text to encode._');
		const result = base64(match);
		return message.send(result);
	},
);

bot(
	{
		pattern: 'ebinary',
		isPublic: true,
		desc: 'Encodes text to binary',
		type: 'utils',
	},
	async (message, match) => {
		if (!match) return message.send('_Provide text to encode._');
		const result = ebinary(match);
		return message.send(result);
	},
);

bot(
	{
		pattern: 'dbinary',
		isPublic: true,
		desc: 'Decodes binary to text',
		type: 'utils',
	},
	async (message, match) => {
		if (!match) return message.send('_Provide binary to decode._');
		const result = dbinary(match);
		return message.send(result);
	},
);

bot(
	{
		pattern: 'obfuscate',
		isPublic: true,
		desc: 'Obfuscates JavaScript code using a basic scrambling technique',
		type: 'utils',
	},
	async (message, match) => {
		if (!match) return message.send('_Provide code to obfuscate._');
		const result = obfuscate(match);
		return message.send(result);
	},
);

bot(
	{
		pattern: 'deobfuscate',
		isPublic: true,
		desc: 'Deobfuscates scrambled and encoded JavaScript code',
		type: 'utils',
	},
	async (message, match) => {
		if (!match) return message.send('_Provide obfuscated code to decode._');
		const result = deobfuscate(match);
		return message.send(result);
	},
);

bot(
	{
		pattern: 'ascii',
		isPublic: true,
		desc: 'Converts each character of the string to its ASCII code',
		type: 'utils',
	},
	async (message, match) => {
		if (!match) return message.send('_Provide text to convert to ASCII._');
		const result = toAscii(match);
		return message.send(result);
	},
);
//==========================added getbio command tested verifed 
bot(
	{
		pattern: 'getbio',
		isPublic: true,
		desc: 'Get the WhatsApp Bio of a User',
		type: 'utils',
	},
	async message => {
		if (message.isGroup) {
			// In a group: check if the user is tagged or replied
			const user = message.reply_message?.sender || message.mention[0];
			if (!user) return message.send('_Reply to or Tag Someone to Get their Bio_');
			try {
				// Fetch bio of the tagged orr replied user
				const status = await message.client.fetchStatus(user);
				if (status && status.status) {
					await message.send(
						`*Bio of ${user.split('@')[0]}:*\n_${status.status}_`
					);
				} else {
					await message.send('_No Bio Found for the User_');
				}
			} catch {
				await message.send('_Failed to Fetch Bio_');
			}
		} else {
			// In personal chat: fetch bio of the sender
			try {
				const status = await message.client.fetchStatus(message.jid);
				if (status && status.status) {
					await message.send(
						`*Your Bio:*\n_${status.status}_`
					);
				} else {
					await message.send('_You Have No Bio Set_');
				}
			} catch {
				await message.send('_Failed to Fetch Your Bio_');
			}
		}
	},
);
