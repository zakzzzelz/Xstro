import config from '../config.js';
import { numtoId } from './utils.js';
import { isSudo } from './sql/sudo.js';
import { isBanned } from './sql/ban.js';

export const commands = [];

export function bot(cmdInfo, func) {
	cmdInfo.function = func;
	cmdInfo.pattern = new RegExp(`^(${config.PREFIX})\\s*(${cmdInfo.pattern})(?:\\s+(.*))?$`, 'i');
	cmdInfo.isPublic = cmdInfo.isPublic || false;
	cmdInfo.dontAddCommandList = cmdInfo.dontAddCommandList || false;
	cmdInfo.type = cmdInfo.type || 'misc';

	commands.push(cmdInfo);
	return cmdInfo;
}

export async function handleCommand(cmd, msg, conn, __patch) {
	if (!msg) return;

	const userJid = msg.sender;
	const userId = userJid ? numtoId(userJid).split('@')[0] : null;

	try {
		if (cmd.on) return await cmd.function(__patch, msg.body || '', msg, conn);
		if (!cmd.pattern) return;

		const match = msg.body.match(cmd.pattern);
		if (!match || match[0] !== msg.body) return;

		const prefix = match[1];
		const args = match[3] ?? '';
		if (prefix !== config.PREFIX) return;

		const [isSudoUser, isBannedUser] = await Promise.all([
			isSudo(userJid),
			isBanned(userJid),
		]);

		const isAllowed = msg.isSelf || isSudoUser || __patch.user;
		const isPrivateMode = config.MODE === 'private';

		if (isAllowed) return await cmd.function(__patch, args, msg, conn);

		if (!isPrivateMode) {
			if (isBannedUser) return await __patch.sendReply(`_@${userId} you have been banned from using commands_`, { mentions: [numtoId(userId)] });

			if (cmd.isPublic) {
				await cmd.function(__patch, args, msg, conn);
			} else {
				await __patch.sendReply(`_@${userId} this command is for owners only!_`, {
					mentions: [numtoId(userId)],
				});
			}
		}
	} catch (err) {
		const cmdName = cmd.pattern.toString().split(/\W+/)[2] || cmd.on;
		const errMsg = `─━❲ ERROR REPORT ❳━─\nFROM: @${userId}\nMESSAGE: ${err.message}\nCMD: ${cmdName}`;
		await conn.sendMessage(__patch.user, {
			text: '```' + errMsg + '```',
			mentions: [numtoId(userId)],
		}, { quoted: msg });
	}
}
