import { createReadStream, unlinkSync, writeFileSync } from 'fs';
import path from 'path';
import axios from 'axios';
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

export const uploadFile = async mediaBuffer => {
	const fileType = FileTypeFromBuffer(mediaBuffer);
	if (!fileType) throw new Error('Unable to determine the file type of the media.');
	const filename = `file.${fileType}`;
	const temp = path.join(process.cwd(), filename);
	writeFileSync(temp, mediaBuffer);
	const form = new FormData();
	form.append('fileToUpload', createReadStream(temp), {
		filename: filename,
		contentType: fileType,
	});
	form.append('reqtype', 'fileupload');
	const response = await axios.post('https://catbox.moe/user/api.php', form, {
		headers: form.getHeaders(),
	});
	const url = response.data.trim();
	unlinkSync(temp);
	return url;
};
