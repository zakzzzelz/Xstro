import fs from 'fs/promises';
import axios from 'axios';
import FormData from 'form-data';
import config from '../../config.js';
import { XUtils } from 'utils';
import { join } from 'path';
import simpleGit from 'simple-git';
import Heroku from 'heroku-client';

const git = simpleGit();
const envPath = join(process.cwd(), '.env');

export async function manageVar(params) {
	const { command, key, value } = params;

	async function readEnv() {
		try {
			return await fs.readFile(envPath, 'utf8');
		} catch (error) {
			if (error.code === 'ENOENT') {
				await fs.writeFile(envPath, '');
				return '';
			}
			throw error;
		}
	}

	switch (command) {
		case 'set': {
			const envContent = await readEnv();
			const lines = envContent.split('\n').filter(line => line.trim());
			const exists = lines.findIndex(line => line.startsWith(`${key}=`));

			if (exists !== -1) {
				lines[exists] = `${key}=${value}`;
			} else {
				lines.push(`${key}=${value}`);
			}

			await fs.writeFile(envPath, lines.join('\n') + '\n');
			return true;
		}
		case 'get': {
			const data = await readEnv();
			return data || null;
		}
		case 'del': {
			const data = await readEnv();
			const lines = data
				.split('\n')
				.filter(line => line.trim() && !line.startsWith(`${key}=`))
				.join('\n');

			await fs.writeFile(envPath, lines + '\n');
			return true;
		}
	}
}

export const updateHerokuApp = async () => {
	const heroku = new Heroku({ token: process.env.HEROKU_API_KEY });

	await git.fetch();
	const commits = await git.log(['master..origin/master']);
	if (commits.total === 0) return '```You already have the latest version installed.```';

	const app = await heroku.get(`/apps/${process.env.HEROKU_APP_NAME}`);
	const gitUrl = app.git_url.replace('https://', `https://api:${process.env.HEROKU_API_KEY}@`);
	await git.addRemote('heroku', gitUrl);
	await git.push('heroku', 'master');

	return '```Bot updated. Restarting.```';
};

export async function flipMedia(buffer, direction) {
	const fileType = XUtils.FileTypeFromBuffer(buffer);
	if (!fileType) throw new Error('Unsupported file type.');
	const { ext, mime } = fileType;
	const form = new FormData();
	form.append('media', buffer, { filename: `media.${ext}`, contentType: mime });
	const res = await axios.post(`${config.BASE_API_URL}/api/flip?direction=${direction}`, form, {
		headers: form.getHeaders(),
		responseType: 'arraybuffer',
	});
	return res.data;
}

export async function toBlackVideo(buffer, color = 'black') {
	const form = new FormData();
	form.append('audio', buffer, {
		filename: 'input-audio.mp3',
		contentType: 'audio/mpeg',
	});
	form.append('color', color);
	const response = await axios.post(`${config.BASE_API_URL}/api/blackvideo`, form, {
		headers: {
			...form.getHeaders(),
		},
		responseType: 'arraybuffer',
	});

	return Buffer.from(response.data);
}

export async function convertToOpus(buffer) {
	const formData = new FormData();

	formData.append('audio', buffer, {
		filename: 'audio.mp3',
		contentType: 'audio/mpeg',
	});
	const res = await axios.post(`${config.BASE_API_URL}/api/convert-to-opus`, formData, {
		headers: {
			...formData.getHeaders(),
		},
		responseType: 'arraybuffer',
	});

	return Buffer.from(res.data);
}

const mimeMap = {
	jpg: { mime: 'image/jpeg', ext: 'jpg' },
	jpeg: { mime: 'image/jpeg', ext: 'jpg' },
	png: { mime: 'image/png', ext: 'png' },
	gif: { mime: 'image/gif', ext: 'gif' },
	webp: { mime: 'image/webp', ext: 'webp' },
	mp4: { mime: 'video/mp4', ext: 'mp4' },
	mp3: { mime: 'audio/mpeg', ext: 'mp3' },
};

const getMimeAndExt = fileType => {
	const mapped = mimeMap[fileType];
	if (!mapped) return null;
	return mapped;
};

export const toSticker = async (buffer, packname = config.STICKER_PACK.split(';')[1], author = config.STICKER_PACK.split(';')[0]) => {
	try {
		const fileType = XUtils.FileTypeFromBuffer(buffer);
		const fileInfo = getMimeAndExt(fileType);
		if (!fileInfo) throw new Error('Unsupported or unknown file type');
		const { mime, ext } = fileInfo;
		const form = new FormData();
		form.append('media', buffer, { filename: `media.${ext}`, contentType: mime });
		form.append('packname', packname);
		form.append('author', author);

		const headers = form.getHeaders();
		const res = await axios.post(`${config.BASE_API_URL}/api/sticker`, form, {
			headers: {
				...headers,
			},
			responseType: 'arraybuffer',
		});

		return res.data;
	} catch (error) {
		throw error;
	}
};

export const remini = async (image, filterType) => {
	const availableFilters = ['enhance', 'recolor', 'dehaze'];
	const selectedFilter = availableFilters.includes(filterType) ? filterType : availableFilters[0];

	const form = new FormData();
	const apiUrl = `https://inferenceengine.vyro.ai/${selectedFilter}`;

	form.append('model_version', 1);

	const imageBuffer = Buffer.isBuffer(image) ? image : fs.readFileSync(image);
	form.append('image', imageBuffer, {
		filename: 'enhance_image_body.jpg',
		contentType: 'image/jpeg',
	});

	try {
		const response = await axios.post(apiUrl, form, {
			headers: {
				...form.getHeaders(),
				'User-Agent': 'okhttp/4.9.3',
				Connection: 'Keep-Alive',
				'Accept-Encoding': 'gzip',
			},
			responseType: 'arraybuffer',
		});
		return Buffer.from(response.data);
	} catch (error) {
		throw new Error(`Error enhancing image: ${error.message}`);
	}
};
