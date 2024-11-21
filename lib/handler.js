import * as baileys from 'baileys';
import config from '../config.js';
import { numtoId } from './utils.js';
import Message from './class/Base.js';

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

export async function handleCommand(cmd, msg, conn) {
	if (!msg) return;
	const Instance = new Message(conn, msg);
	const user = msg.sender ? msg.sender.split('@')[0].split(':')[0] : '';

	try {
		if (cmd.on) {
			await cmd.function(Instance, msg.body || '', msg, conn);
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
				await Instance.react('⏳');
				await baileys.delay(500);
			}
			await cmd.function(Instance, args, msg, conn);
			return;
		}

		if (!msg.mode) {
			if (msg.ban) {
				await Instance.sendReply(`_@${user} you have been banned from using commands_`, { mentions: [msg.sender] });
				return;
			}
			if (cmd.isPublic) {
				if (config.CMD_REACT) {
					await Instance.react('⏳');
					await baileys.delay(500);
				}
				await cmd.function(Instance, args, msg, conn);
				return;
			} else {
				await Instance.sendReply(`_@${user} this command is for owners only!_`, { mentions: [msg.sender] });
				return;
			}
		}
	} catch (err) {
		const cmdName = cmd.pattern.toString().split(/\W+/)[2] || cmd.on;
		const errMsg = `─━❲ ERROR REPORT ❳━─\nFROM: @${user}\nMESSAGE: ${err.message}\nCMD: ${cmdName}`;
		await Instance.sendReply(`_*${cmdName}* command error_`);
		await conn.sendMessage(Instance.user, { text: '```' + errMsg + '```', mentions: [numtoId(user)] }, { quoted: msg });
	}
}
