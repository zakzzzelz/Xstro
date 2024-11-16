import { bot } from '../lib/client/plugins.js';
import { extractUrlFromMessage } from '../lib/utils.js';
import { shortUrl, textToPDF, TTS, upload } from './client/scrapers.js';

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
		if (!url) return message.sendReply('_No Url Found!_\n_Provide a vaild url, ex. https://google.com_');
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

bot(
	{
		pattern: 'url',
		isPublic: false,
		desc: 'Converts Image/Video to URL',
		type: 'tools',
	},
	async message => {
		if (!message.quoted?.image && !message.quoted?.video) return message.sendReply('_Reply Image/Video_');
		const media = await message.download();
		if (!media) return message.sendReply('_No media found. Please reply to an image or video!_');
		const msg = await message.sendReply('_Processing..._');
		const res = await upload(media);
		return await msg.edit(res.url);
	},
);
