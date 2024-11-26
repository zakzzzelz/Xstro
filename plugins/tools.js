import { bot } from '../lib/handler.js';
import { extractUrlFromMessage, getBuffer } from '../lib/utils.js';
import { shortUrl, textToPDF, TTS, uploadMedia } from './client/scrapers.js';

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
		pattern: 'short',
		isPublic: true,
		desc: 'Shortens Provide Url',
		type: 'tools',
	},
	async (message, match) => {
		const url = extractUrlFromMessage(match || message.quoted?.text);
		if (!url) return message.sendReply('```I NEED A VAILD URL```');
		const msg = await message.sendReply('```SHORTING LINK```');
		const link = await shortUrl(url);
		return msg.edit(`${link}`);
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
		const res = await uploadMedia(media);
		return await msg.edit(res);
	},
);

bot(
	{
		pattern: 'getpp',
		isPublic: true,
		desc: 'Get Another Person Profile Image',
		type: 'tools',
	},
	async message => {
		if (message.isGroup) {
			const user = message.quoted?.sender || message.mention[0];
			if (!user) return message.sendReply('_Reply Or Tag Someone_');
			try {
				const pp = await message.client.profilePictureUrl(user, 'image');
				const res = await getBuffer(pp);
				await message.send(res);
			} catch {
				message.sendReply('_No Profile Photo_');
			}
		} else {
			try {
				const pp = await message.client.profilePictureUrl(message.jid, 'image');
				const res = await getBuffer(pp);
				await message.send(res);
			} catch {
				message.sendReply('_No Profile Photo_');
			}
		}
	},
);
