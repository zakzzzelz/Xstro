import { bot } from '../lib/client/plugins.js';
import { extractUrlFromMessage } from '../lib/utils.js';
import { shortUrl, textToPDF, TTS } from './client/scrapers.js';

bot(
	{
		pattern: 'topdf',
		isPublic: true,
		desc: 'Converts Text to PDF',
		type: 'tools',
	},
	async (message, match) => {
		const textMsg = match || message.quoted?.text;
		if (!textMsg) return message.sendReply('_Reply/Provide Text Message_');
		const doc = await textToPDF(textMsg);
		return await message.send(doc);
	},
);

bot(
	{
		pattern: 'surl',
		isPublic: true,
		desc: 'Shortens Provide Url',
		type: 'tools',
	},
	async (message, match) => {
		const url = extractUrlFromMessage(match || message.quoted?.text);
		if (!url) return message.sendReply('_No Url Found!_');
		const msg = await message.sendReply('_Wait_');
		const link = await shortUrl(url);
		return msg.edit(link);
	},
);

bot(
	{
		pattern: 'tts',
		isPublic: true,
		desc: 'Text to Speech',
		type: 'tools',
	},
	async (message, match, { pushName }) => {
		const text = match || message.quoted?.text;
		if (!text) return message.sendReply(`_${pushName} you didn't provide me text_`);
		const data = await TTS(text);
		return await message.send(data);
	},
);
