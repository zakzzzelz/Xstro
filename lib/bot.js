import { Antilink, AntiSpammer, AntiViewOnce, AntiWord, AutoKick, Antifake } from '#bot';
import { getConfig } from '#sql';

export async function getConfigValues() {
	const db_list = await getConfig();
	const { autoRead, autoStatusRead, cmdReact, cmdRead, mode, PREFIX } = db_list;
	return { autoRead, autoStatusRead, cmdReact, cmdRead, mode, PREFIX };
}

export async function upserts(msg) {
	const tasks = [AntiSpammer(msg), AntiViewOnce(msg)];
	if (msg.isGroup) tasks.push(Antilink(msg), AntiWord(msg), AutoKick(msg));
	Promise.all(tasks);
}
