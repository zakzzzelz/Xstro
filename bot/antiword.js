import { isJidGroup } from 'baileys';

export async function AntiWord(msg) {
	if (!isJidGroup(msg.from)) return;
}
