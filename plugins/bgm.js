import { bot } from '#lib';
import { addBgm, getBgmResponse, deleteBgm, getBgmList } from '#sql';
import { join } from 'path';
import fs from 'fs/promises';

const bgmdata = join('bgm');

(async () => {
	try {
		await fs.access(bgmdata);
	} catch {
		await fs.mkdir(bgmdata, { recursive: true });
	}
})();

bot(
	{
		pattern: 'addbgm',
		public: false,
		desc: 'Add a new BGM entry',
		usage: '.addbgm word;response or .addbgm word;(as reply)',
	},
	async (message, match) => {
		if (!match) return message.send('_Example: .addbgm hello;response_');

		const [word] = match.split(';');
		if (!word) return message.send('_Word required_');

		if (message.reply_message?.audio || message.reply_message?.video) {
			const media = await message.download();
			const extension = message.reply_message.audio ? 'mp3' : 'mp4';
			const fileName = `${word}.${extension}`;
			const filePath = join(bgmdata, fileName);

			await fs.writeFile(filePath, media);
			await addBgm(word, filePath);
			return message.send(`_BGM added for ${word}_`);
		}

		const response = match.slice(word.length + 1);
		if (!response) return message.send('_Response required_');

		await addBgm(word, response);
		return message.send(`_BGM added for ${word}_`);
	},
);

bot(
	{
		pattern: 'getbgm',
		desc: 'Get a BGM by word',
		usage: '.getbgm word',
	},
	async (message, match) => {
		if (!match) return message.send('_Example: .getbgm hello_');

		const response = await getBgmResponse(match.trim().toLowerCase());
		if (!response) return message.send(`_No BGM found for ${match}_`);

		if (response.startsWith('bgm/') || response.startsWith('bgm\\')) {
			const buffer = await fs.readFile(response);
			return message.send(buffer, { type: 'audio' });
		}
		return message.send(`_BGM for ${match}: ${response}_`);
	},
);

bot(
	{
		pattern: 'delbgm',
		public: false,
		desc: 'Delete a BGM entry',
	},
	async (message, match) => {
		if (!match) return message.send('_Example: .delbgm hello_');

		const word = match.trim().toLowerCase();
		const response = await getBgmResponse(word);
		if (!response) return message.send(`_No BGM found for ${word}_`);

		await deleteBgm(word);
		if (response.startsWith('bgm/') || response.startsWith('bgm\\')) {
			await fs.unlink(response);
		}
		return message.send(`_BGM deleted for ${word}_`);
	},
);

bot(
	{
		pattern: 'listbgm',
		public: false,
		desc: 'List all available BGMs',
	},
	async message => {
		const bgmList = await getBgmList();
		if (!bgmList.length) return message.send('_No BGMs found_');

		const formattedList = bgmList
			.map(bgm => {
				const response =
					bgm.response.startsWith('bgm/') ||
					bgm.response.startsWith('bgm\\')
						? bgm.response.replace(/[\\/]/g, '')
						: bgm.response;
				return `${bgm.word} ☌ ${response}`;
			})
			.join('\n');

		return message.send(`\`\`\`BGM List:\n\n${formattedList}\`\`\``);
	},
);

bot(
	{
		on: 'text',
		dontAddCommandList: true,
	},
	async message => {
		if (message.sender === message.user) return;
		const response = await getBgmResponse(
			message.text.trim().toLowerCase(),
		);
		if (!response) return;

		if (response.startsWith('bgm/') || response.startsWith('bgm\\')) {
			const buffer = await fs.readFile(response);
			return message.send(buffer, { type: 'audio' });
		}
		return message.send(response);
	},
);
