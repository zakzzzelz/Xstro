import config from '../config.js';
import { numtoId, sleep } from './utils.js';

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
	const user = msg.sender ? numtoId(msg.sender).split('@')[0] : null;

	try {
		if (cmd.on) {
			await cmd.function(__patch, msg.body || '', msg, conn);
			return;
		}
		if (!cmd.pattern) return;

		const match = msg.body.match(cmd.pattern);
		if (!match || match[0] !== msg.body) return;

		const prefix = match[1];
		const args = match[3] ?? '';
		if (prefix !== config.PREFIX) return;

		if (msg.sudo) {
			if (config.CMD_REACT) {
				await __patch.react('⏳');
				await sleep(500);
			}
			await cmd.function(__patch, args, msg, conn);
			return;
		}

		if (!msg.mode) {
			if (msg.ban) {
				await __patch.sendReply(`_@${user} you have been banned from using commands_`, { mentions: [msg.sender] });
				return;
			}
			if (cmd.isPublic) {
				if (config.CMD_REACT) {
					await __patch.react('⏳');
					await sleep(500);
				}
				await cmd.function(__patch, args, msg, conn);
				return;
			} else {
				await __patch.sendReply(`_@${user} this command is for owners only!_`, { mentions: [msg.sender] });
				return;
			}
		}
	} catch (err) {
		const cmdName = cmd.pattern.toString().split(/\W+/)[2] || 'Event Emitter';
		const errMsg = `─━❲ ERROR REPORT ❳━─\nFROM: @${user}\nMESSAGE: ${err.message}\nCMD: ${cmdName}`;
		await __patch.sendReply('```' + cmdName + ' err, unable to execute\nCheck your dm for more error details```');
		await conn.sendMessage(__patch.user, { text: '```' + errMsg + '```', mentions: [msg.sender] }, { quoted: msg });
	}
}
