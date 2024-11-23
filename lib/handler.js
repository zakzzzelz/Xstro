import config from '../config.js';
import { numtoId, sleep } from './utils.js';

export const commands = [];

export const bot = (cmdInfo, func) =>
	commands.push({
		...cmdInfo,
		function: func,
		pattern: new RegExp(`^(${config.PREFIX})\\s*(${cmdInfo.pattern})(?:\\s+(.*))?$`, 'i'),
		isPublic: cmdInfo.isPublic || false,
		dontAddCommandList: cmdInfo.dontAddCommandList || false,
		type: cmdInfo.type || 'misc',
	});

export async function handleCommand(cmd, msg, conn, __patch) {
	if (!msg) return;
	const user = msg?.sender ? numtoId(msg.sender).split('@')[0] : null;

	try {
		const match = cmd.pattern?.exec(msg.body);
		if (!match?.[0] === msg.body || match?.[1] !== config.PREFIX) return;

		const args = match[3] ?? '';
		const canExecute = msg.sudo || (!msg.mode && !msg.ban && cmd.isPublic);

		if (!canExecute) {
			const message = msg.ban ? `_@${user} you have been banned from using commands_` : `_@${user} this command is for owners only!_`;

			await __patch.sendReply(message, { mentions: [msg.sender] });
			return;
		}

		config.CMD_REACT && (await __patch.react('⏳')) && (await sleep(500));
		await cmd.function(__patch, args, msg, conn);
	} catch (err) {
		const cmdName = cmd.pattern?.toString().split(/\W+/)[2] || 'Event Emitter';
		const errMsg = `─━❲ ERROR REPORT ❳━─\nFROM: @${user}\nMESSAGE: ${err.message}\nCMD: ${cmdName}`;

		await Promise.all([__patch.sendReply(`\`\`\`${cmdName} err, unable to execute\nCheck your dm for more error details\`\`\``), conn.sendMessage(__patch.user, { text: `\`\`\`${errMsg}\`\`\``, mentions: [msg.sender] }, { quoted: msg })]);
	}
	if (cmd.on) await cmd.function(__patch, msg.body || '', msg, conn);
	return;
}
