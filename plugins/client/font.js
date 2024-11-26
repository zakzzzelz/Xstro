import axios from 'axios'
/**
 *
 * @param {string} text - Converts text to fancy fonts
 * @returns string
 */
export function fancy(text) {
	const alphabetMap = {
		0: '𝟶',
		1: '𝟷',
		2: '𝟸',
		3: '𝟹',
		4: '𝟺',
		5: '𝟻',
		6: '𝟼',
		7: '𝟽',
		8: '𝟾',
		9: '𝟿',
		a: 'ᴀ',
		b: 'ʙ',
		c: 'ᴄ',
		d: 'ᴅ',
		e: 'ᴇ',
		f: 'ғ',
		g: 'ɢ',
		h: 'ʜ',
		i: 'ɪ',
		j: 'ᴊ',
		k: 'ᴋ',
		l: 'ʟ',
		m: 'ᴍ',
		n: 'ɴ',
		o: 'ᴏ',
		p: 'ᴘ',
		q: 'ǫ',
		r: 'ʀ',
		s: 's',
		t: 'ᴛ',
		u: 'ᴜ',
		v: 'ᴠ',
		w: 'ᴡ',
		x: 'x',
		y: 'ʏ',
		z: 'ᴢ',
		A: 'ᴀ',
		B: 'ʙ',
		C: 'ᴄ',
		D: 'ᴅ',
		E: 'ᴇ',
		F: 'ғ',
		G: 'ɢ',
		H: 'ʜ',
		I: 'ɪ',
		J: 'ᴊ',
		K: 'ᴋ',
		L: 'ʟ',
		M: 'ᴍ',
		N: 'ɴ',
		O: 'ᴏ',
		P: 'ᴘ',
		Q: 'ǫ',
		R: 'ʀ',
		S: 's',
		T: 'ᴛ',
		U: 'ᴜ',
		V: 'ᴠ',
		W: 'ᴡ',
		X: 'x',
		Y: 'ʏ',
		Z: 'ᴢ',
	};

	return text
		.split('')
		.map(char => alphabetMap[char] || char)
		.join('');
}

/**
 *
 * @param {string} text - flips text to a reverse direction
 * @returns string
 */
export function flipText(text) {
	return text.split('').reverse().join('');
}


export async function fancyText(inputText, option = null) {
	const apiUrl = `https://api.giftedtech.my.id/api/tools/fancy?apikey=gifted&text=${encodeURIComponent(inputText)}`;

	const response = await axios.get(apiUrl);
	if (response.data.status === 200 && response.data.success) {
		const results = response.data.results;
		if (option !== null && !isNaN(option) && option >= 0 && option < results.length) {
			return results[option].result || "Invalid style selected.";
		}
		return results.map(r => r.result).filter(r => r).join("\n");
	}
}