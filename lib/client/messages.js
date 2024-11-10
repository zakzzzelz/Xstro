import { saveMessage, saveContact } from '../sql/store.js';
export async function saveMessageAndContact(msg) {
	await saveMessage(msg, msg.sender);
	await saveContact(msg.sender, msg.pushName);
}
