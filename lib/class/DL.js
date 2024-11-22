import { getBuffer, getJson } from '../utils.js';

class DL {
	/**
	 * Download content from Facebook.
	 * @param {string} url - The content URL.
	 * @returns {Promise<Buffer>} - The content buffer.
	 */
	async facebook(url) {
		return getBuffer(url);
	}

	/**
	 * Download content from YouTube.
	 * @param {string} url - The video URL.
	 * @returns {Promise<Buffer>} - The video buffer.
	 */
	async youtube(url) {
		return getBuffer(url);
	}

	/**
	 * Play audio or video from a URL.
	 * @param {string} text - URL or media identifier.
	 * @returns {Promise<Buffer>} - The media buffer.
	 */
	async play(text) {
		return getBuffer(text);
	}

	/**
	 * Download content from Twitter.
	 * @param {string} url - The tweet URL.
	 * @returns {Promise<Buffer>} - The tweet buffer.
	 */
	async twitter(url) {
		return getBuffer(url);
	}

	/**
	 * Download content from Instagram.
	 * @param {string} url - The post URL.
	 * @returns {Promise<Buffer>} - The content buffer.
	 */
	async instagram(url) {
		return getBuffer(url);
	}

	/**
	 * Download content from Mediafire.
	 * @param {string} url - The Mediafire link.
	 * @returns {Promise<Buffer>} - The content buffer.
	 */
	async mediafire(url) {
		return getBuffer(url);
	}

	/**
	 * Download content from Spotify.
	 * @param {string} url - The track or playlist URL.
	 * @returns {Promise<Buffer>} - The audio buffer.
	 */
	async spotify(url) {
		return getBuffer(url);
	}

	/**
	 * Download content from TikTok.
	 * @param {string} url - The TikTok video URL.
	 * @returns {Promise<Buffer>} - The video buffer.
	 */
	async tiktok(url) {
		return getBuffer(url);
	}

	/**
	 * Download content from Vimeo.
	 * @param {string} url - The video URL.
	 * @returns {Promise<Buffer>} - The video buffer.
	 */
	async vimeo(url) {
		return getBuffer(url);
	}

	/**
	 * Download content from SoundCloud.
	 * @param {string} url - The track URL.
	 * @returns {Promise<Buffer>} - The audio buffer.
	 */
	async soundcloud(url) {
		return getBuffer(url);
	}

	/**
	 * Download content from Pinterest.
	 * @param {string} url - The pin URL.
	 * @returns {Promise<Buffer>} - The image buffer.
	 */
	async pinterest(url) {
		return getBuffer(url);
	}

	/**
	 * Download content from Reddit.
	 * @param {string} url - The post URL.
	 * @returns {Promise<Buffer>} - The content buffer.
	 */
	async reddit(url) {
		return getBuffer(url);
	}

	/**
	 * Download content from Snapchat.
	 * @param {string} url - The Snap URL.
	 * @returns {Promise<Buffer>} - The content buffer.
	 */
	async snapchat(url) {
		return getBuffer(url);
	}
}

export default DL;
