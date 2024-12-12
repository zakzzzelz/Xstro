import { getConfig } from '../sql/config.js';

export async function getConfigValues() {
	const db_list = await getConfig();
	const { autoRead, autoStatusRead, cmdReact, cmdRead, mode } = db_list;
	return { autoRead, autoStatusRead, cmdReact, cmdRead, mode };
}
