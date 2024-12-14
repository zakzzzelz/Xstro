import config from '../config.js';
import { extractUrlFromString, getJson } from 'xstro-utils';
import { bot } from '../lib/cmds.js';
import { base64, dbinary, deobfuscate, ebinary, obfuscate, remini, solveMath, toAscii } from '../lib/xstro.js';

bot(
	{
		pattern: 'getpp',
		isPublic: true,
		desc: 'Get Another Person Profile Image',
	},
	async (message, match) => {
		const jid = await message.thatJid(match);
		const img = await message.thatProfilePic(jid);
		await message.send(img);
	},
);

bot(
	{
		pattern: 'surl',
		isPublic: true,
		desc: 'Shorterns A Url',
	},
	async (message, match) => {
		const url = extractUrlFromString(match || message.reply_message?.text);
		if (!url) return message.send('_No Url found_');
		const msg = await message.send('*wait*');
		const res = await getJson(`${config.XSTRO_API}/api/shorten?url=${url}`);
		return await msg.edit(res.link);
	},
);

bot(
	{
		pattern: 'calc',
		isPublic: true,
		desc: 'Solves Math Equation',
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
	},
	async (message, match) => {
		if (!match) return message.send('_Provide text to convert to ASCII._');
		const result = toAscii(match);
		return message.send(result);
	},
);

bot(
	{
		pattern: 'getbio',
		isPublic: true,
		desc: 'Get the WhatsApp Bio of a User',
	},
	async (message, match) => {
		const jid = await message.thatJid(match);
		if (!jid) return message.send('_Reply Someone, Tag Someone or Provide their Number_');
		const bioDetails = await message.client.fetchStatus(jid);
		const { status, setAt } = bioDetails;
		if (status && setAt) {
			await message.send(`\`\`\`@${jid.split('@')[0]} bio's\n\nBio: ${status}\n\nSetAt: ${setAt}\`\`\``, { mentions: [jid] });
		} else {
			message.send('_Unable to Get user bio_');
		}
	},
);

bot(
	{
		pattern: 'enhance',
		isPublic: true,
		desc: 'Enahnces An Image',
	},
	async message => {
		if (!message.reply_message?.image) return message.send('_Reply An Image_');
		const buff = await message.download();
		const enhancedImg = await remini(buff, 'enhance');
		await message.send(enhancedImg);
	},
);

bot(
	{
		pattern: 'recolor',
		isPublic: true,
		desc: 'Recolors An Image',
	},
	async message => {
		if (!message.reply_message?.image) return message.send('_Reply An Image_');
		const buff = await message.download();
		const enhancedImg = await remini(buff, 'recolor');
		await message.send(enhancedImg);
	},
);

bot(
	{
		pattern: 'dehaze',
		isPublic: true,
		desc: 'Dehazes An Image',
	},
	async message => {
		if (!message.reply_message?.image) return message.send('_Reply An Image_');
		const buff = await message.download();
		const enhancedImg = await remini(buff, 'dehaze');
		await message.send(enhancedImg);
	},
);
