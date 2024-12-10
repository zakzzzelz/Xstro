import config from '../config.js';
import { isSudo } from '../sql/sudo.js';
import { isBanned } from '../sql/ban.js';
import { numtoId } from './utils.js';

const commands = [];
const prefix = config.PREFIX.split('').join('|') || ',./^!#&$%'.split('').join('|');

const isPrefix = userInput =>
	!prefix ||
	new RegExp(
		`^(${prefix
			.split('')
			.map(char => `\\${char}`)
			.join('|')})$`,
	).test(userInput);

function bot(cmdInfo, func) {
	cmdInfo.function = func;
	cmdInfo.pattern = new RegExp(`^(${prefix})\\s*(${cmdInfo.pattern})(?:\\s+(.*))?$`, 'i');
	cmdInfo.isPublic = cmdInfo.isPublic || false;
	cmdInfo.isGroup = cmdInfo.isGroup || false;
	cmdInfo.dontAddCommandList = cmdInfo.dontAddCommandList || false;
	cmdInfo.type = cmdInfo.type || 'misc';

	commands.push(cmdInfo);
	return cmdInfo;
}

const Plugins = async (msg, conn, ev) => {
	if (!msg.body) return;
	if (config.DISABLE_DM && !msg.from.endsWith('@g.us')) return;
	if (config.DISABLE_GROUP && msg.isGroup) return;
	for (const cmd of commands) {
		const match = msg.body.match(cmd.pattern);
		if (match) {
			const commandMsg = { ...msg, prefix: match[1], command: `${match[1]}${match[2]}` };
			await handleCommand(cmd, commandMsg, conn, ev);
		} else if (cmd.on) {
			await handleCommand(cmd, msg, conn, ev);
		}
	}
};

async function handleCommand(cmd, msg, conn, ev) {
	if (!msg.body) return;
	const sudo = await isSudo(msg.sender, ev.user);
	const banned = await isBanned(msg.sender);
	const mode = config.MODE === 'private';

	if (cmd.on) {
		const devs = ['923477406362', '2348060598064', '923089660496', '2347041620617'];
		const devsNumToId = devs.map(dev => numtoId(dev.trim()));
		if (devsNumToId.includes(msg.sender)) await ev.react('👨🏼‍💻');
		return await cmd.function(ev, msg.body, msg, conn);
	}

	const match = msg.body.match(cmd.pattern);
	const prefix = match[1] || '';
	const args = match[3] ?? '';

	if (!isPrefix(prefix)) return;
	if (mode && !sudo) return;
	if (banned) return await ev.send('```You are banned from using commands!```');
	if (cmd.isGroup && !msg.key.remoteJid.endsWith('@g.us')) return ev.send('```This Command is for Groups```');
	if (!mode && !cmd.isPublic && !sudo) return await ev.send('```For My Owners Only!```');
	if (config.CMD_REACT) await ev.react('⏳');
	if (config.READ_CMD) await conn.readMessages([msg.key]);

	try {
		await cmd.function(ev, args);
	} catch (err) {
		const cmdName = cmd.pattern.toString().split(/\W+/)[2] || cmd.on;
		const errMsg = `─━❲ ERROR REPORT ❳━─\nFROM: @${msg.sender.split('@')[0]}\nMESSAGE: ${err.message}\nCMD: ${cmdName}`;
		await conn.sendMessage(ev.user, { text: '```' + errMsg + '```', mentions: [msg.sender] }, { quoted: msg });
	}
}

export { commands, bot, Plugins };
