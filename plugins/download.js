import { bot } from '#lib';
import { extractUrl, isfacebook, isInsta } from '#utils';
import { getBuffer, getJson } from 'xstro-utils';

const API = `https://api.nexoracle.com`;
const KEY = `free_key@maher_apis`;

bot(
	{
		pattern: 'apk',
		public: true,
		desc: 'Downloads Apk files',
		type: 'download'
	},
	async (message, match) => {
		if (!match) return message.send('_Give me Apk, eg. WhatsApp_');
		const data = (await getJson(`${API}/downloader/apk?apikey=${KEY}&q=${match}`)).result;
		const app = await getBuffer(data.dllink);
		return message.sendFile(app, data.name, data.name);
	}
);

bot(
	{
		pattern: 'facebook',
		public: true,
		desc: 'Downloads facebook Videos & Reels',
		type: 'download'
	},
	async (message, match) => {
		let url;
		url = match || message.reply_message.text;
		if (!url) return message.send('_No facebook link found!_');
		url = extractUrl(url);
		if (!isfacebook(url)) return message.send('_Provide facebook link!_');
		const data = (await getJson(`${API}/downloader/facebook2?apikey=${KEY}&url=${url}`)).result;
		return await message.sendFromUrl(data.videoUrl, true, { caption: data.title });
	}
);

bot(
	{
		pattern: 'instagram',
		public: true,
		desc: 'Downloads Instagram, video & reels',
		type: 'download'
	},
	async (message, match) => {
		let url;
		url = match || message.reply_message.text;
		if (!url) return message.send('_No Instagram link found!_');
		url = extractUrl(url);
		url = url.replace(/https:\/\/www\.instagram\.com\/([^\/]+)\//, 'https://www.instagram.com/');
		if (!isInsta(url)) return message.send('_Provide Instagram link!_');
		const data = (await getJson(`${API}/downloader/insta2?apikey=${KEY}&url=${url}`)).result;
		return await message.sendFromUrl(data.video);
	}
);

bot(
	{
		pattern: 'story',
		public: true,
		desc: 'Downloads Instagram Stories',
		type: 'download'
	},
	async (message, match) => {
		if (!match) return message.send('_Give me IG username_');
		const data = await fetch(`${API}/downloader/insta-story?apikey=${KEY}&username=${match}`)
			.then(r => r.json())
			.then(json => (json.status === 200 && json.result ? json.result : false))
			.catch(() => false);
		if (!data) return message.send(`_${match} has no stories at the moment_`);
		for (const story of data) {
			await message.sendFromUrl(story.url);
		}
	}
);

// bot(
// 	{
// 		pattern: 
// 	}
// )