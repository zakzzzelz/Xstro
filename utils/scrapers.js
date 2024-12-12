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
