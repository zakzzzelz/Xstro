import fs from 'fs/promises';
import { writeFileSync } from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export const GIFBufferToVideoBuffer = async image => {
	const filename = `${Date.now()}`;
	const gifPath = `./${filename}.gif`;
	const mp4Path = `./${filename}.mp4`;
	writeFileSync(gifPath, image);
	await new Promise((resolve, reject) => {
		ffmpeg().input(gifPath).outputOptions(['-movflags faststart', '-pix_fmt yuv420p', '-vf scale=trunc(iw/2)*2:trunc(ih/2)*2']).toFormat('mp4').save(mp4Path).on('end', resolve).on('error', reject);
	});
	const buffer = await fs.readFile(mp4Path);
	await Promise.all([fs.unlink(mp4Path), fs.unlink(gifPath)]);

	return buffer;
};
