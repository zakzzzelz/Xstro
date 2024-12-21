import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import { createReadStream } from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';
import { FileTypeFromBuffer } from 'xstro-utils';

/**
 * Enhances or filters images using the Vyro AI API.
 * @async
 * @param {Buffer|string} image - The image buffer or file path to process
 * @param {string} [filterType='enhance'] - The type of filter to apply ('enhance', 'recolor', or 'dehaze')
 * @returns {Promise<Buffer>} A buffer containing the processed image data
 * @throws {Error} If the API request fails
 */

export const remini = async (image, filterType) => {
	const availableFilters = ['enhance', 'recolor', 'dehaze'];
	const selectedFilter = availableFilters.includes(filterType)
		? filterType
		: availableFilters[0];
	const apiUrl = `https://inferenceengine.vyro.ai/${selectedFilter}`;

	const form = new FormData();
	form.append('model_version', 1);

	const imageBuffer = Buffer.isBuffer(image) ? image : readFileSync(image);
	form.append('image', imageBuffer, {
		filename: 'enhance_image_body.jpg',
		contentType: 'image/jpeg',
	});
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
};

/**
 * Uploads a file to Catbox hosting service.
 * @async
 * @param {Buffer} mediaBuffer - The buffer containing the file data to upload
 * @returns {Promise<string>} The URL of the uploaded file
 * @throws {Error} If the file type cannot be determined or if the upload fails
 */
export const uploadFile = async mediaBuffer => {
	const fileType = await FileTypeFromBuffer(mediaBuffer);
	if (!fileType)
		throw new Error('Unable to determine the file type of the media.');
	const filename = `file.${fileType}`;
	const tempPath = path.join(process.cwd(), filename);
	writeFileSync(tempPath, mediaBuffer);

	const form = new FormData();
	form.append('fileToUpload', createReadStream(tempPath), {
		filename,
		contentType: fileType,
	});
	form.append('reqtype', 'fileupload');

	const response = await axios.post(
		'https://catbox.moe/user/api.php',
		form,
		{
			headers: form.getHeaders(),
		},
	);
	const url = response.data.trim();
	unlinkSync(tempPath);
	return url;
};

/**
 * Removes the background from an image using the remove.bg API
 * @param {Buffer} buffer - The input image buffer
 * @returns {Promise<Buffer>} A buffer containing the image with removed background
 * @throws {Error} If the API request fails
 * @async
 */
export async function removeBg(buffer) {
	const formData = new FormData();
	const type = await FileTypeFromBuffer(buffer);
	const inputPath = path.join(process.cwd(), `temp_image.${type}`);
	writeFileSync(inputPath, buffer);
	formData.append('size', 'auto');
	formData.append(
		'image_file',
		createReadStream(inputPath),
		path.basename(inputPath),
	);
	const { status, data } = await axios.post(
		'https://api.remove.bg/v1.0/removebg',
		formData,
		{
			responseType: 'arraybuffer',
			headers: {
				...formData.getHeaders(),
				'X-Api-Key': 'FjyTadatkyWixWGWUCUDTF7J',
			},
			encoding: null,
		},
	);
	unlinkSync(inputPath);
	return data;
}
