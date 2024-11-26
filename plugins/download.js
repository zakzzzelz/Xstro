import config from '../config.js'
import { bot } from '../lib/handler.js'
import { extractUrlFromMessage, getBuffer, getJson } from '../lib/utils.js'

export const base_url = 'https://api.giftedtech.my.id/api/download/'
const { API_KEY } = config

bot(
	{
		pattern: 'facebook',
		isPublic: true,
		desc: 'Downloads Facebook Videos',
		type: 'download'
	},
	async (message, match) => {
		const req = extractUrlFromMessage(match || message.reply_message?.text)
		if (!req) return message.sendReply('```I need Facebook Url!````')
		const res = await getJson(`${base_url}facebook?apikey=${API_KEY}&url=${req}`)
		const buff = await getBuffer(res.result.hd_video)
		return await message.send(buff)
	}
)

bot(
	{
		pattern: 'insta',
		isPublic: true,
		desc: 'Downloads Instagram Videos',
		type: 'download'
	},
	async (message, match) => {
		const req = extractUrlFromMessage(match || message.reply_message?.text)
		if (!req) return message.sendReply('```I need Instagram Url!````')
		const res = await getJson(`${base_url}instadl?apikey=${API_KEY}&type=video&url=${req}`)
		const buff = await getBuffer(res.result.download_url)
		return await message.send(buff)
	}
)

bot(
	{
		pattern: 'twitter',
		isPublic: true,
		desc: 'Downloads Videos from twiiter',
		type: 'download'
	},
	async (message, match) => {
		const req = extractUrlFromMessage(match || message.reply_message?.text)
		if (!req) return message.sendReply('```I need Twitter Url!````')
		const res = await getJson(`${base_url}twitter?apikey=${API_KEY}&url=${req}`)
		const buff = await getBuffer(res.result.downloads[0].url)
		return await message.send(buff)
	}
)

bot(
	{
		pattern: 'tiktok',
		isPublic: true,
		desc: 'Downloads Tiktok Videos',
		type: 'download'
	},
	async (message, match) => {
		const req = extractUrlFromMessage(match || message.reply_message?.text)
		if (!req) return message.sendReply('```I need Tiktok Url!````')
		const res = await getJson(`${base_url}tiktokdlv1?apikey=${API_KEY}&url=${req}`)
		const buff = await getBuffer(res.result.video.noWatermark)
		return await message.send(buff)
	}
)

bot(
	{
		pattern: 'tikslide',
		isPublic: true,
		desc: 'Downloads Tiktok Slides',
		type: 'download'
	},
	async (message, match) => {
		const req = extractUrlFromMessage(match || message.reply_message?.text);
		if (!req) return message.sendReply('```I need a TikTok URL!```');
		const res = await getJson(`${base_url}tiktokslide?apikey=${API_KEY}&url=${req}`);
		for (const slideUrl of res.results) {
			const buff = await getBuffer(slideUrl);
			await message.send(buff);
		}
	}
);

bot(
	{
		pattern: 'tgs',
		isPublic: false,
		desc: 'Downloads telegram Stickers',
		type: 'download'
	},
	async (message, match) => {
		const req = extractUrlFromMessage(match || message.reply_message?.text);
		if (!req) return message.sendReply('```I need a Telegram Stickers Pack URL!```');
		const res = await getJson(`${base_url}tgs?apikey=${API_KEY}&url=${req}`);
		for (const sticker of res.results) {
			const buff = await getBuffer(sticker)
			await message.send(buff, { type: 'sticker' })
		}
	}
)

bot(
	{
		pattern: 'mediafire',
		isPublic: false,
		desc: 'Downloads Mediafire files',
		type: 'download'
	},
	async (message, match) => {
		const req = extractUrlFromMessage(match || message.reply_message?.text);
		if (!req) return message.sendReply('```I need a Mediafire URL!```');
		const res = await getJson(`${base_url}mediafiredl?apikey=${API_KEY}&url=${req}`);
		const buff = await getBuffer(res.result.downloadLink)
		return await message.send(buff)
	}
)

bot(
	{
		pattern: 'ytv',
		isPublic: false,
		desc: 'Downloads Youtube Videos',
		type: 'download'
	},
	async (message, match) => {
		const req = extractUrlFromMessage(match || message.reply_message?.text);
		if (!req) return message.sendReply('```I need a YOUTUBE URL!```');
		const res = await getJson(`${base_url}ytvideo?apikey=${API_KEY}&url=${req}`);
		const buff = await getBuffer(res.result.download_url)
		return await message.send(buff, { caption: res.result.title })
	}
)

bot(
	{
		pattern: 'yta',
		isPublic: false,
		desc: 'Downloads Youtube Audio',
		type: 'download'
	},
	async (message, match) => {
		const req = extractUrlFromMessage(match || message.reply_message?.text);
		if (!req) return message.sendReply('```I need a YOUTUBE URL!```');
		const res = await getJson(`${base_url}ytvideo?apikey=${API_KEY}&url=${req}`);
		const buff = await getBuffer(res.result.download_url)
		return await message.send(buff)
	}
)
