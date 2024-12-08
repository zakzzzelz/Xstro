import FormData from 'form-data';
import { FileTypeFromBuffer } from 'utils';
import { bot } from '../lib/plugins.js';

bot(
	{
		pattern: 'upload',
		desc: 'Upload files and get a shareable URL.',
		type: 'tools',
	},
	async message => {
		if (!message.reply_message?.image && !message.reply_message?.video && !message.reply_message?.audio && !message.reply_message?.document) {
			return message.send('_Reply to an Image, Video, Audio, or Document_');
		}

		const msg = await message.send('*Wait...*');
		const media = await message.downloadAndSaveMedia();
		const res = await uploadFile(media);
		await msg.edit(res);
		await msg.react('✅');
	},
);

const uploadFile = async media => {
	const fileType = FileTypeFromBuffer(media);
	const filename = `file.${fileType}`;

	const form = new FormData();
	form.append('fileToUpload', media, {
		filename: filename,
		contentType: fileType.mime,
	});
	form.append('reqtype', 'fileupload');
	const response = await fetch('https://catbox.moe/user/api.php', {
		method: 'POST',
		body: form,
	});
	const url = await response.text();
	return url;
};
