import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import Crypto from 'crypto';
import webp from 'node-webpmux';
import { tmpdir } from 'os';
import { getMimeType } from 'xstro-utils';
import { config } from '#config';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function convertWebPFile(media) {
  try {
    const tempDir = path.join('temp_frames');
    const tempOutput = path.join(tempDir, 'output.mp4');
    await fs.promises.mkdir(tempDir, { recursive: true });
    const metadata = await sharp(media).metadata();
    if (!metadata.pages) throw new Error('Input file is not an animated WebP');
    for (let i = 0; i < metadata.pages; i++) {
      const frame = await sharp(media, { page: i }).jpeg({ quality: 90 }).toBuffer();
      await fs.promises.writeFile(
        path.join(tempDir, `frame_${String(i).padStart(5, '0')}.jpg`),
        frame
      );
    }
    const ffmpegCommand = `ffmpeg -framerate ${30} -i "${path.join(tempDir, 'frame_%05d.jpg')}" \
            -c:v libx264 -pix_fmt yuv420p -y "${tempOutput}"`;
    await execAsync(ffmpegCommand);
    const buffer = await fs.promises.readFile(tempOutput);
    await fs.promises.rm(tempDir, { recursive: true });
    return buffer;
  } catch (error) {
    try {
      await fs.promises.rm('temp_frames', { recursive: true, force: true });
    } catch (cleanupError) {
      console.error('Error during cleanup:', cleanupError);
    }
    console.error('Error during conversion:', error);
    throw error;
  }
}

async function imageToWebp(media) {
  const tmpFileOut = path.join(
    tmpdir(),
    `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`
  );
  const tmpFileIn = path.join(
    tmpdir(),
    `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.jpg`
  );

  fs.writeFileSync(tmpFileIn, media);

  const ffmpegCommand = `ffmpeg -i "${tmpFileIn}" -vf "scale=512:512:force_original_aspect_ratio=decrease" -c:v libwebp -quality 60 "${tmpFileOut}"`;

  try {
    const { stderr } = await execAsync(ffmpegCommand);
    if (stderr) console.error('FFmpeg stderr:', stderr);

    const buff = fs.readFileSync(tmpFileOut);
    fs.unlinkSync(tmpFileOut);
    fs.unlinkSync(tmpFileIn);
    return buff;
  } catch (error) {
    if (fs.existsSync(tmpFileIn)) fs.unlinkSync(tmpFileIn);
    if (fs.existsSync(tmpFileOut)) fs.unlinkSync(tmpFileOut);
    throw new Error(`FFmpeg conversion failed: ${error.message}`);
  }
}

async function videoToWebp(media) {
  const tmpFileOut = path.join(
    tmpdir(),
    `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`
  );
  const tmpFileIn = path.join(
    tmpdir(),
    `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.mp4`
  );

  fs.writeFileSync(tmpFileIn, media);

  const ffmpegCommand = `ffmpeg -i "${tmpFileIn}" -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=15" -c:v libwebp -loop 0 -preset picture -t 00:00:05 -quality 60 "${tmpFileOut}"`;

  try {
    const { stderr } = await execAsync(ffmpegCommand);
    if (stderr) console.error('FFmpeg stderr:', stderr);

    const buff = fs.readFileSync(tmpFileOut);
    fs.unlinkSync(tmpFileOut);
    fs.unlinkSync(tmpFileIn);
    return buff;
  } catch (error) {
    if (fs.existsSync(tmpFileIn)) fs.unlinkSync(tmpFileIn);
    if (fs.existsSync(tmpFileOut)) fs.unlinkSync(tmpFileOut);
    throw new Error(`FFmpeg conversion failed: ${error.message}`);
  }
}

async function writeExifImg(media, metadata = {}) {
  const wMedia = await imageToWebp(media);
  const tmpFileIn = path.join(
    tmpdir(),
    `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`
  );
  const tmpFileOut = path.join(
    tmpdir(),
    `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`
  );

  try {
    fs.writeFileSync(tmpFileIn, wMedia);
    const img = new webp.Image();
    await img.load(tmpFileIn);

    if (metadata.packname || metadata.author) {
      const json = {
        'sticker-pack-id': `https://github.com/AstroX11/Xstro`,
        'sticker-pack-name': metadata.packname,
        'sticker-pack-publisher': metadata.author,
        emojis: metadata.categories ? metadata.categories : [''],
      };
      const exifAttr = Buffer.from([
        0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00,
      ]);
      const jsonBuff = Buffer.from(JSON.stringify(json), 'utf-8');
      const exif = Buffer.concat([exifAttr, jsonBuff]);
      exif.writeUIntLE(jsonBuff.length, 14, 4);
      img.exif = exif;
    }

    await img.save(tmpFileOut);
    const buff = fs.readFileSync(tmpFileOut);
    fs.unlinkSync(tmpFileOut);
    fs.unlinkSync(tmpFileIn);
    return buff;
  } catch (error) {
    if (fs.existsSync(tmpFileIn)) fs.unlinkSync(tmpFileIn);
    if (fs.existsSync(tmpFileOut)) fs.unlinkSync(tmpFileOut);
    throw error;
  }
}

async function writeExifVid(media, metadata = {}) {
  const wMedia = await videoToWebp(media);
  const tmpFileIn = path.join(
    tmpdir(),
    `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`
  );
  const tmpFileOut = path.join(
    tmpdir(),
    `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`
  );

  try {
    fs.writeFileSync(tmpFileIn, wMedia);
    const img = new webp.Image();
    await img.load(tmpFileIn);

    if (metadata.packname || metadata.author) {
      const json = {
        'sticker-pack-id': `https://github.com/AstroX11/Xstro`,
        'sticker-pack-name': metadata.packname,
        'sticker-pack-publisher': metadata.author,
        emojis: metadata.categories ? metadata.categories : [''],
      };
      const exifAttr = Buffer.from([
        0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00,
      ]);
      const jsonBuff = Buffer.from(JSON.stringify(json), 'utf-8');
      const exif = Buffer.concat([exifAttr, jsonBuff]);
      exif.writeUIntLE(jsonBuff.length, 14, 4);
      img.exif = exif;
    }

    await img.save(tmpFileOut);
    const buff = fs.readFileSync(tmpFileOut);
    fs.unlinkSync(tmpFileOut);
    fs.unlinkSync(tmpFileIn);
    return buff;
  } catch (error) {
    if (fs.existsSync(tmpFileIn)) fs.unlinkSync(tmpFileIn);
    if (fs.existsSync(tmpFileOut)) fs.unlinkSync(tmpFileOut);
    throw error;
  }
}

export const createSticker = async (buffer) => {
  const mime = await getMimeType(buffer);
  let res;
  const options = {
    packname: config.STICKER_PACK.split(';')[0] || 'χѕтяσ м∂',
    author: config.STICKER_PACK.split(';')[1] || 'αѕтяσχ11',
  };

  try {
    if (mime.startsWith('image/')) {
      res = await writeExifImg(buffer, options);
    } else if (mime.startsWith('video/')) {
      res = await writeExifVid(buffer, options);
    } else {
      throw new Error('Only images and videos are supported');
    }
    return res;
  } catch (error) {
    console.error('Sticker creation error:', error);
    throw new Error(`Sticker creation failed: ${error.message}`);
  }
};
