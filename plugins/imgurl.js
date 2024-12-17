import { bot } from '#lib/cmds';
import { uploadFile } from '#lib/xstro';

bot(
	{
		pattern: 'upload',
		isPublic: true,
		desc: 'Upload files and get a shareable URL.',
	},
	async message => {
		if (!message.reply_message?.image && !message.reply_message?.video && !message.reply_message?.audio && !message.reply_message?.document) {
			return message.send('_Reply to an Image, Video, Audio, or Document_');
		}

		const msg = await message.send('*Wait...*');
		const media = await message.download();
		const res = await uploadFile(media);
		await msg.edit(res);
		return await msg.react('✅');
	},
);
