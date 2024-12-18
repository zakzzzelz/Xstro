import { Antilink } from '#bot/antilink';
import { AntiWord } from '#bot/antiword';
import { AutoKick } from '#bot/autokick';
import { getConfig } from '#sql/config';

export async function getConfigValues() {
	const db_list = await getConfig();
	const { autoRead, autoStatusRead, cmdReact, cmdRead, mode, PREFIX } = db_list;
	return { autoRead, autoStatusRead, cmdReact, cmdRead, mode, PREFIX };
}

export async function upserts(msg, conn) {
	if (msg.isGroup) {
		await Antilink(msg);
		await AntiWord(msg);
		await AutoKick(conn, msg);
	}
}
