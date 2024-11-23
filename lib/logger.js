import config from '../config.js';

export const logger = {
	level: 'silent',
	log() {},
	info() {},
	warn() {},
	error() {},
	trace() {},
	debug() {},
	child() {
		return this;
	},
};
export async function logMessages(rawMessage, conn) {
	if (!config.LOGGER) return;
	const msg = rawMessage;
	if (!msg.isGroup) {
		console.log(`FROM: ${msg.pushName}\nMESSAGE: ${msg.body || msg.type}`);
	} else {
		const groupName = await conn.groupMetadata(msg.from);
		console.log(`GROUP: ${groupName.subject || 'Unknown'}\nFROM: ${msg.pushName}\nMESSAGE: ${msg.body || msg.type}`);
	}
}
