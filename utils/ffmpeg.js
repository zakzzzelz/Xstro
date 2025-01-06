import fs from 'fs';
import path from 'path';
import os from 'os';
import ffmpeg from 'fluent-ffmpeg';
import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg';

const { writeFileSync, unlinkSync, existsSync, readFileSync, mkdirSync } = fs;
ffmpeg.setFfmpegPath(ffmpegPath);

const tempDir = path.join(os.tmpdir(), 'media-temp');
if (!existsSync(tempDir)) mkdirSync(tempDir, { recursive: true });

function createTempPath(ext) {
	return path.join(tempDir, `${Date.now()}.${ext}`);
}

function cleanUp(paths = []) {
	paths.forEach(file => existsSync(file) && unlinkSync(file));
}

export const GIFBufferToVideoBuffer = async image => {
	const filename = `${Date.now()}`;
	const gifPath = `./${filename}.gif`;
	const mp4Path = `./${filename}.mp4`;
	writeFileSync(gifPath, image);
	await new Promise((resolve, reject) => {
		ffmpeg().input(gifPath).outputOptions(['-movflags faststart', '-pix_fmt yuv420p', '-vf scale=trunc(iw/2)*2:trunc(ih/2)*2']).toFormat('mp4').save(mp4Path).on('end', resolve).on('error', reject);
	});
	const buffer = readFileSync(mp4Path);
	await Promise.all([fs.unlink(mp4Path), fs.unlink(gifPath)]);

	return buffer;
};

export async function audioToBlackVideo(input) {
	const audio = createTempPath('mp3');
	const video = createTempPath('mp4');

	return new Promise((resolve, reject) => {
		ffmpeg()
			.input(`color=black:s=1920x1080:r=30`)
			.inputOptions(['-f', 'lavfi'])
			.input(input)
			.outputOptions(['-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '23', '-c:a', 'aac', '-b:a', '128k', '-map', '0:v', '-map', '1:a', '-shortest'])
			.output(video)
			.on('end', () => {
				const videoBuffer = readFileSync(video);
				cleanUp([audio, video]);
				resolve(videoBuffer);
			})
			.on('error', err => {
				cleanUp([audio, video]);
				reject(err);
			})
			.run();
	});
}

export async function flipMedia(file, direction = 'horizontal') {
	const validDirections = ['left', 'right', 'vertical', 'horizontal'];
	if (!validDirections.includes(direction?.toLowerCase())) {
		throw new Error('Invalid direction. Use: left, right, vertical, or horizontal');
	}

	const command = ffmpeg(file);

	switch (direction.toLowerCase()) {
		case 'left':
			command.videoFilters('transpose=2');
			break;
		case 'right':
			command.videoFilters('transpose=1');
			break;
		case 'vertical':
			command.videoFilters('vflip');
			break;
		case 'horizontal':
			command.videoFilters('hflip');
			break;
	}
	await new Promise((resolve, reject) => {
		command.on('end', resolve).on('error', reject).save(tempDir);
	});
	return readFileSync(tempDir);
}
