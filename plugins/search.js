import config from '../config.js';
import { bot } from '../lib/plugins.js';
import { getBuffer, getJson } from 'utils';
const base_url = 'https://api.giftedtech.my.id/api/';
const { API_KEY } = config;

bot(
	{
		pattern: 'lyrics',
		isPublic: true,
		desc: 'Search Lyrics',
	},
	async (message, match) => {
		const req = match || message.reply_message?.text;
		if (!req) return message.send('_Give me song Name_');
		const res = await getJson(`https://itzpire.com/search/lyrics?query=${req}`);
		const { title, album, thumb, lyrics } = res.data;
		const image = await getBuffer(thumb);
		return await message.send(image, { caption: `*${title}*\n\`\`\`${album}\n\n${lyrics}\`\`\`` });
	},
);

bot(
	{
		pattern: 'stickersearch',
		isPublic: true,
		desc: 'Search and Download Stickers',
	},
	async (message, match) => {
		if (!match) return message.send('```Give me a search query```');
		const req = await getJson(`${base_url}search/stickersearch?apikey=${API_KEY}&query=${match}`);
		for (const stickerUrl of req.results.sticker) {
			const buff = await getBuffer(stickerUrl);
			await message.send(buff, { type: 'sticker' });
		}
	},
);

bot(
	{
		pattern: 'google',
		isPublic: true,
		desc: 'Search and Get Google Results',
	},
	async (message, match) => {
		if (!match) return message.send('```Give me a search query```');
		const req = await getJson(`https://api.giftedtech.my.id/api/search/google?apikey=${API_KEY}&query=${match}`);
		if (!req.results || req.results.length === 0) return message.send('```No results found for your query.```');
		let resultsMessage = '';
		req.results.forEach(result => {
			resultsMessage += `\n\n*Title:* ${result.title}\n*Description:* ${result.description}\n*URL:* ${result.url}\n\n`;
		});
		await message.send(`\`\`\`*Google Search*\n\n${resultsMessage}\`\`\``);
	},
);

bot(
	{
		pattern: 'imdb',
		isPublic: true,
		desc: 'Sends info of a movie or series.',
	},
	async (message, match) => {
		if (!match) return message.send('_Name a Series or movie._');
		const data = await getJson(`http://www.omdbapi.com/?apikey=742b2d09&t=${encodeURIComponent(match)}&plot=full`);
		let imdbInfo = [`*Title:* ${data.Title}`, `*Year:* ${data.Year}`, `*Rated:* ${data.Rated}`, `*Released:* ${data.Released}`, `*Runtime:* ${data.Runtime}`, `*Genre:* ${data.Genre}`, `*Director:* ${data.Director}`, `*Writer:* ${data.Writer}`, `*Actors:* ${data.Actors}`, `*Plot:* ${data.Plot}`, `*Language:* ${data.Language}`, `*Country:* ${data.Country}`, `*Awards:* ${data.Awards}`, `*BoxOffice:* ${data.BoxOffice}`, `*Production:* ${data.Production}`, `*IMDb Rating:* ${data.imdbRating}`, `*IMDb Votes:* ${data.imdbVotes}`].join('\n\n');
		const buff = await getBuffer(data.Poster);
		await message.send(buff, { caption: imdbInfo });
	},
);

bot(
	{
		pattern: 'weather ?(.*)',
		isPublic: true,
		desc: 'weather info',
	},
	async (message, match) => {
		if (!match) return await message.send('*Example : weather delhi*');
		const data = await getJson(`http://api.openweathermap.org/data/2.5/weather?q=${match}&units=metric&appid=060a6bcfa19809c2cd4d97a212b19273&language=en`).catch(() => {});
		if (!data) return await message.send(`_${match} not found_`);
		const { name, timezone, sys, main, weather, visibility, wind } = data;
		const degree = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'][Math.floor(wind.deg / 22.5 + 0.5) % 16];
		const formatTime = (timestamp, timezoneOffset) => {
			const localTime = new Date((timestamp + timezoneOffset) * 1000);
			return new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).format(localTime);
		};
		const sunrise = formatTime(sys.sunrise, timezone);
		const sunset = formatTime(sys.sunset, timezone);
		return await message.send(`*Name :* ${name}\n*Country :* ${sys.country}\n*Weather :* ${weather[0].description}\n*Temp :* ${Math.floor(main.temp)}°\n*Feels Like :* ${Math.floor(main.feels_like)}°\n*Humidity :* ${main.humidity}%\n*Visibility  :* ${visibility}m\n*Wind* : ${wind.speed}m/s ${degree}\n*Sunrise :* ${sunrise}\n*Sunset :* ${sunset}`);
	},
);

bot(
	{
		pattern: 'define',
		isPublic: true,
		desc: 'Define A Word',
	},
	async (message, match) => {
		if (!match) return message.send('```Provide A Word to Define```');
		const word = match.trim();
		const res = await getJson(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
		return res && res.length > 0 ? message.send(`**${word}**: ${res[0]?.meanings?.[0]?.definitions?.[0]?.definition}`) : message.send('```No definition found for this word.```');
	},
);

bot(
	{
		pattern: 'rizz',
		isPublic: true,
		desc: 'Rizz your babe lol',
	},
	async message => {
		const msg = await message.send('```Yoo````');
		const res = await getJson('https://rizzapi.vercel.app/random');
		return msg.edit('```' + res.text + '```');
	},
);

bot(
	{
		pattern: 'joke',
		isPublic: true,
		desc: 'Get a Random Joke',
	},
	async message => {
		const msg = await message.send('```Hmm```');
		const res = await getJson('https://official-joke-api.appspot.com/random_joke');
		return msg.edit(`\`\`\`${res.setup} - ${res.punchline}\`\`\``);
	},
);

bot(
	{
		pattern: 'quotes',
		isPublic: true,
		desc: 'Get Quotes',
	},
	async message => {
		const msg = await message.send('```Getting Quotes```');
		const res = await getJson('https://zenquotes.io/api/random');
		return msg.edit(`\`\`\`Quote: ${res.q}\nAuthor: ${res.a}\`\`\``);
	},
);

bot(
	{
		pattern: 'facts',
		isPublic: true,
		desc: 'Get Facts',
	},
	async message => {
		const msg = await message.send('```Fetching Facts```');
		const res = await getJson('https://uselessfacts.jsph.pl/api/v2/facts/random?language=en');
		return msg.edit(`\`\`\`${res.text}\`\`\``);
	},
);
