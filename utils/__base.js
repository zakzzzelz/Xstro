import { XSTRO_API } from './scrapers.js';

class ApiError extends Error {
	constructor(message, status, data) {
		super(message);
		this.name = 'ApiError';
		this.status = status;
		this.data = data;
	}
}

/**
 * Uploads a file to the API
 * @param {string} url - API endpoint
 * @param {Object} data - File and metadata
 * @param {File|Blob|Buffer} data.file - File to upload
 * @param {Object} [options] - Request options
 * @param {Object} [options.headers] - Additional headers
 * @param {number} [options.timeout] - Timeout in ms
 * @param {AbortSignal} [options.signal] - Abort signal
 * @returns {Promise<Object>} - API response
 */
async function postUpload(url, data, options = {}) {
	const formData = new FormData();
	if (data.file instanceof File || data.file instanceof Blob) {
		const ext = data.file.type ? `.${data.file.type.split('/')[1]}` : '';
		formData.append('file', data.file instanceof Blob && !data.file.name ? data.file : data.file, data.file instanceof Blob && !data.file.name ? `file${ext}` : undefined);
	} else if (Buffer.isBuffer(data.file)) {
		formData.append('file', new Blob([data.file]), data.filename || 'file.bin');
	} else throw new Error('Invalid file type. Expected File, Blob, or Buffer.');
	Object.entries(data).forEach(([k, v]) => k !== 'file' && v !== undefined && formData.append(k, typeof v === 'object' ? JSON.stringify(v) : v));
	const fetchOptions = { method: 'POST', body: formData, headers: { ...options.headers }, signal: options.signal };
	let timeoutId;
	if (options.timeout) {
		const controller = new AbortController();
		if (!options.signal) fetchOptions.signal = controller.signal;
		timeoutId = setTimeout(() => controller.abort(), options.timeout);
	}
	try {
		const response = await fetch(url, fetchOptions);
		const responseData = await response.json();
		if (!response.ok) throw new ApiError(responseData.message || 'Upload failed', response.status, responseData);
		return responseData;
	} finally {
		if (timeoutId) clearTimeout(timeoutId);
	}
}

/**
 * Uploads a file with default settings
 * @param {File|Blob|Buffer} file - File to upload
 * @param {string} [baseUrl=XSTRO_API] - Base API URL
 * @param {Object} [opts] - Additional options
 * @returns {Promise<Object>} - Upload result
 */
async function uploadFile(file, baseUrl = XSTRO_API, opts) {
	try {
		const response = await postUpload(`${baseUrl}/api/upload`, { file, ...opts }, { timeout: 30000, headers: { 'User-Agent': 'Mozilla/5.0', DNT: 1, 'Upgrade-Insecure-Request': 1 }, ...opts });
		return { success: true, fileUrl: response.fileUrl, rawUrl: response.rawUrl, expiresAt: response.expiresAt, originalname: response.originalname, size: response.size, type: response.type };
	} catch (error) {
		return { success: false, error: error.message, status: error.status };
	}
}

export { postUpload, uploadFile, ApiError };
