import { bot } from '../lib/client/plugins.js';
import { toSticker } from './client/scrapers.js';

bot(
	{
		pattern: 'sticker',
		isPublic: true,
		desc: 'Converts Images/Video',
		type: 'converter',
	},
	async message => {
		const media = message.quoted?.video || message.quoted?.image;
		if (!media) return message.sendReply('_Reply Image or Video!_');
		const msg = await message.download();
		const buff = await toSticker(msg);
		return await message.send(buff, { type: 'sticker' });
	},
);

bot(
	{
		pattern: 'take',
		isPublic: true,
		desc: 'Resends Sticker As Own',
		type: 'converter',
	},
	async message => {
		if (!message.quoted?.sticker) return message.sendReply('_Reply Sticker_');
		const msg = await message.download();
		const buff = await toSticker(msg);
		return await message.send(buff, { type: 'sticker' });
	},
);
