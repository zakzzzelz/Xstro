import { Antilink } from '../bot/antilink.js';
import { AntiWord } from '../bot/antiword.js';
import { getConfig } from '../sql/config.js';

export async function getConfigValues() {
	const db_list = await getConfig();
	const { autoRead, autoStatusRead, cmdReact, cmdRead, mode, PREFIX } = db_list;
	return { autoRead, autoStatusRead, cmdReact, cmdRead, mode, PREFIX };
}

export async function upserts(msg) {
	if (msg.isGroup) {
		await Antilink(msg);
		await AntiWord(msg);
	}
}
