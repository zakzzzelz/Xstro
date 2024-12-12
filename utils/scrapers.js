import axios from 'axios';
import * as cheerio from 'cheerio';
import { getRandom } from '../lib/utils.js';

export async function facebook(videoUrl) {
	const gifted = await import('gifted-downs');
	const key = 'Nayan';
	const data = await gifted.default.fbdown2(videoUrl, key);
	const hd = data.media.hd;
	const sd = data.media.sd;

	return {
		hd_video: hd,
		sd_video: sd,
	};
}

export async function instagram(urls, type) {
	const url = 'https://indownloader.app/request';
	const data = new URLSearchParams();
	data.append('link', urls);
	data.append('downloader', type);

	const headers = {
		Accept: 'application/json, text/javascript, */*; q=0.01',
		'Accept-Language': 'en-US,en;q=0.9',
		Connection: 'keep-alive',
		'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
		Cookie: 'PHPSESSID=c1qc786t4r439k0ogf4pb50fgm; _ga_W9Q84JYKKD=GS1.1.1731120140.1.0.1731120140.0.0.0; _ga=GA1.1.979138462.1731120140; __gads=ID=89f41a0cc4734339:T=1731120140:RT=1731120140:S=ALNI_MY2FNGnAVDIkwE35v-IsEMzweOqRQ; __gpi=UID=00000f643ea193e0:T=1731120140:RT=1731120140:S=ALNI_MZrYvEtDAXMOExu4wavywGulS6Vww; __eoi=ID=439a66e4e79cc71a:T=1731120140:RT=1731120140:S=AA-AfjYcG5P7RNtPZLXiHOfQX-lR; FCNEC=%5B%5B%22AKsRol_dAqS6oEYU_-IReCxUk3gKXwJ2xCeHvSlTukmIMcqkQCHNZwEAOtXKQei1epvT9elPBlfUzZXCt90jGPgL2VxRUyCckXJr2GxBFqKEoWr8-2L-T54bWkO_QF6v_biozNwmo9Ka_19Sya7XHyjX40pA30kNuw%3D%3D%22%5D%5D',
		Origin: 'https://indownloader.app',
		Referer: 'https://indownloader.app/',
		'User-Agent': 'MyApp/1.0',
		'X-Requested-With': 'XMLHttpRequest',
	};

	const response = await axios.post(url, data.toString(), { headers });
	const html = response.data.html;
	const $ = cheerio.load(html);
	const thumbnailUrl = $('.post-thumb img').attr('src');
	const videoUrl = $('.download-options a').attr('href');

	return {
		thumbnail: thumbnailUrl,
		download_url: videoUrl,
	};
}

export async function twitter(id) {
	const url = 'https://ssstwitter.com';
	const response = await axios.get(url, {
		headers: {
			'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36',
		},
	});

	const $ = cheerio.load(response.data);
	const form = $('form.pure-form.pure-g.hide-after-request');
	const includeVals = form.attr('include-vals');
	const ttMatch = includeVals.match(/tt:'([^']+)'/);
	const tsMatch = includeVals.match(/ts:(\d+)/);

	if (!ttMatch || !tsMatch) throw new Error('Cannot find tt or ts values.');

	const tt = ttMatch[1];
	const ts = tsMatch[1];

	const postData = new URLSearchParams({
		tt: tt,
		ts: ts,
		source: 'form',
		id: id,
		locale: 'en',
	});

	const postResponse = await axios.post(url, postData.toString(), {
		headers: {
			'HX-Request': 'true',
			'HX-Target': 'target',
			'HX-Current-URL': 'https://ssstwitter.com/en',
			'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
			'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36',
			Referer: 'https://ssstwitter.com/result_normal',
		},
	});

	const $result = cheerio.load(postResponse.data);
	const downloads = [];
	$result('.result_overlay a.download_link').each((i, element) => {
		const text = $(element).text().trim();
		const url = $(element).attr('href');
		if (url) {
			downloads.push({ text, url });
		}
	});

	const data = {
		title: $result('.result_overlay h2').text().trim(),
		downloads: getRandom(downloads),
	};

	return data;
}
