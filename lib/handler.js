import * as baileys from 'baileys';
import config from '../config.js';
const { CMD_REACT, PREFIX } = config;
import { numtoId } from './utils.js';
import Message from './message.js';

export async function handleCommand(cmd, msg, conn) {
	const Instance = new Message(conn, msg);
	try {
		if (cmd.on) {
			await cmd.function(Instance, msg.body || '', msg, conn);
		} else if (cmd.pattern) {
			const user = msg.sender;
			const match = msg.body.match(cmd.pattern);
			if (match && match[0] === msg.body) {
				const prefix = match[1];
				if (prefix === PREFIX) {
					const args = match[3] ?? '';
					if (msg.sudo) {
						if (CMD_REACT) {
							await Instance.react('⌛');
							await baileys.delay(500);
						}
						await cmd.function(Instance, args, msg, conn);
					} else if (msg.mode && !msg.sudo) {
						return;
					} else if (!msg.mode && cmd.isPublic) {
						if (msg.ban) return Instance.sendReply(`_@${user.replace('@s.whatsapp.net', '')} you have been banned from using commands_`, { mentions: [msg.sender] });
						if (CMD_REACT) {
							await Instance.react('⌛');
							await baileys.delay(500);
						}
						await cmd.function(Instance, args, msg, conn);
					} else if (!msg.mode && !cmd.isPublic) {
						if (msg.ban) return Instance.sendReply(`_@${user.split('@')[0].split(':')[0]} you have been banned from using commands_`, { mentions: [msg.sender] });
						return Instance.sendReply(`_@${user.split('@')[0].split(':')[0]} this command is for owners only!_`, { mentions: [msg.sender] });
					}
				}
			}
		}
	} catch (err) {
		const user = msg.sender.split('@')[0].split(':')[0];
		const cmdName = cmd.pattern.toString().split(/\W+/)[2] || cmd.on;
		const errMsg = `─━❲ ERROR REPORT ❳━─\nFROM: @${user}\nMESSAGE: ${err.message}\nCMD: ${cmdName}`;
		return await conn.sendMessage(Instance.user, { text: '```' + errMsg + '```', mentions: [numtoId(user)] }, { quoted: msg });
	}
}
