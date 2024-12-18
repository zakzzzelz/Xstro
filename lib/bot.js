import { Antilink } from '#bot/antilink';
import { AntiSpammer } from '#bot/antispam';
import { AntiWord } from '#bot/antiword';
import { AutoKick } from '#bot/autokick';
import { getConfig } from '#sql/config';

export async function getConfigValues() {
	const db_list = await getConfig();
	const { autoRead, autoStatusRead, cmdReact, cmdRead, mode, PREFIX } = db_list;
	return { autoRead, autoStatusRead, cmdReact, cmdRead, mode, PREFIX };
}

export async function upserts(msg) {
	const tasks = [AntiSpammer(msg)];
	if (msg.isGroup) tasks.push(Antilink(msg), AntiWord(msg), AutoKick(msg));
	Promise.all(tasks);
}
