import fs from 'fs';
import path from 'path';
import os from 'os';
import sharp from 'sharp';
import { exec } from 'child_process';
import { promisify } from 'util';
import { FileTypeFromBuffer } from 'xstro-utils';

const execAsync = promisify(exec);
const { writeFileSync, existsSync, readFileSync, mkdirSync } = fs;

const tempDir = path.join(os.tmpdir(), 'media-temp');
if (!existsSync(tempDir)) mkdirSync(tempDir, { recursive: true });

function temp(ext) {
  return path.join(tempDir, `${Date.now()}.${ext}`);
}

async function saveInputFile(buffer) {
  const fileType = await FileTypeFromBuffer(buffer);
  if (!fileType) throw new Error('Unknown file type');
  const inputPath = temp(fileType);
  writeFileSync(inputPath, buffer);
  return inputPath;
}

export const GIFBufferToVideoBuffer = async (image) => {
  const gifPath = temp('gif');
  const mp4Path = temp('mp4');
  writeFileSync(gifPath, image);

  try {
    await execAsync(
      `ffmpeg -i "${gifPath}" -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" -f mp4 "${mp4Path}"`
    );
    const buffer = readFileSync(mp4Path);
    fs.unlinkSync(mp4Path);
    fs.unlinkSync(gifPath);
    return buffer;
  } catch (error) {
    if (existsSync(mp4Path)) fs.unlinkSync(mp4Path);
    if (existsSync(gifPath)) fs.unlinkSync(gifPath);
    throw error;
  }
};

export async function audioToBlackVideo(input) {
  const inputFile = await saveInputFile(input);
  const video = temp('mp4');

  try {
    await execAsync(
      `ffmpeg -f lavfi -i "color=black:s=1920x1080:r=30" -i "${inputFile}" -c:v libx264 -preset ultrafast -crf 23 -c:a aac -b:a 128k -map 0:v -map 1:a -shortest "${video}"`
    );
    const buffer = readFileSync(video);
    fs.unlinkSync(video);
    fs.unlinkSync(inputFile);
    return buffer;
  } catch (error) {
    if (existsSync(video)) fs.unlinkSync(video);
    if (existsSync(inputFile)) fs.unlinkSync(inputFile);
    throw error;
  }
}

export async function flipMedia(input, direction) {
  const inputFile = await saveInputFile(input);
  const fileType = await FileTypeFromBuffer(input);
  const outputFile = temp(fileType);

  const validDirections = {
    left: 'transpose=2',
    right: 'transpose=1',
    vertical: 'vflip',
    horizontal: 'hflip',
  };

  try {
    await execAsync(`ffmpeg -i "${inputFile}" -vf "${validDirections[direction]}" "${outputFile}"`);
    const buffer = readFileSync(outputFile);
    fs.unlinkSync(outputFile);
    fs.unlinkSync(inputFile);
    return buffer;
  } catch (error) {
    if (existsSync(outputFile)) fs.unlinkSync(outputFile);
    if (existsSync(inputFile)) fs.unlinkSync(inputFile);
    throw error;
  }
}

export async function webpToImage(input) {
  const inputFile = temp('webp');
  const outputImage = temp('jpg');
  writeFileSync(inputFile, input);

  try {
    await execAsync(`ffmpeg -i "${inputFile}" "${outputImage}"`);
    const buffer = readFileSync(outputImage);
    fs.unlinkSync(outputImage);
    fs.unlinkSync(inputFile);
    return buffer;
  } catch (error) {
    if (existsSync(outputImage)) fs.unlinkSync(outputImage);
    if (existsSync(inputFile)) fs.unlinkSync(inputFile);
    throw error;
  }
}

export async function convertToMp3(input) {
  const inputFile = await saveInputFile(input);
  const outputAudio = temp('mp3');

  try {
    await execAsync(`ffmpeg -i "${inputFile}" -c:a libmp3lame -b:a 192k "${outputAudio}"`);
    const buffer = readFileSync(outputAudio);
    fs.unlinkSync(outputAudio);
    fs.unlinkSync(inputFile);
    return buffer;
  } catch (error) {
    if (existsSync(outputAudio)) fs.unlinkSync(outputAudio);
    if (existsSync(inputFile)) fs.unlinkSync(inputFile);
    throw error;
  }
}

export async function toPTT(input) {
  const inputFile = await saveInputFile(input);
  const outputAudio = temp('opus');

  try {
    await execAsync(
      `ffmpeg -i "${inputFile}" -c:a libopus -ac 1 -ar 48000 -b:a 128k -application voip "${outputAudio}"`
    );
    const buffer = readFileSync(outputAudio);
    fs.unlinkSync(outputAudio);
    fs.unlinkSync(inputFile);
    return buffer;
  } catch (error) {
    if (existsSync(outputAudio)) fs.unlinkSync(outputAudio);
    if (existsSync(inputFile)) fs.unlinkSync(inputFile);
    throw error;
  }
}

export async function toVideo(input) {
  const inputFile = await saveInputFile(input);
  const outputVideo = temp('mp4');

  try {
    await execAsync(
      `ffmpeg -i "${inputFile}" -c:v libx264 -crf 32 -preset slow -c:a aac -b:a 128k -ar 44100 "${outputVideo}"`
    );
    const buffer = readFileSync(outputVideo);
    fs.unlinkSync(outputVideo);
    fs.unlinkSync(inputFile);
    return buffer;
  } catch (error) {
    if (existsSync(outputVideo)) fs.unlinkSync(outputVideo);
    if (existsSync(inputFile)) fs.unlinkSync(inputFile);
    throw error;
  }
}
export const cropToCircle = async (input) => {
  try {
    const image = sharp(input);
    const { width, height } = await image.metadata();
    const circleMask = Buffer.from(
      `<svg width="${width}" height="${height}">
		<circle cx="${width / 2}" cy="${height / 2}" r="${Math.min(width, height) / 2}" fill="white"/>
	  </svg>`
    );

    const croppedImage = await image
      .composite([{ input: circleMask, blend: 'dest-in' }])
      .toFormat('webp', { quality: 50 })
      .toBuffer();
    return croppedImage;
  } catch (error) {
    console.error('Error cropping image to circle:', error);
    throw error;
  }
};

export async function resizeImage(imageBuffer, width, height) {
  if (!Buffer.isBuffer(imageBuffer)) {
    throw new Error('The imageBuffer parameter must be a valid Buffer.');
  }

  return sharp(imageBuffer)
    .resize(width, height, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .toBuffer();
}

export const isAnimatedWebp = (filePath) => {
  return new Promise((resolve, reject) => {
    sharp(filePath)
      .metadata()
      .then((metadata) => {
        resolve(metadata.pages > 1); // If pages > 1, it's animated
      })
      .catch((error) => {
        reject(error);
      });
  });
};
