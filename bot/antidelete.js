import { loadMessage } from '../sql/store.js';

export async function AntiDelete(update, conn) {
	if (update.key && (update.update.deleteMessage || update.update?.message === null)) {
		const store = await loadMessage(update.key.id);
	}
}
