import { Antilink } from '../bot/antilink.js';
import { getConfig } from '../sql/config.js';

export async function getConfigValues() {
	const db_list = await getConfig();
	const { autoRead, autoStatusRead, cmdReact, cmdRead, mode } = db_list;
	return { autoRead, autoStatusRead, cmdReact, cmdRead, mode };
}

export async function upserts(msg) {
	if (msg.isGroup) {
		await Antilink(msg);
	}
}
