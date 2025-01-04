import { isSudo, isBanned, isCmdDisabled } from '#sql';
import { getConfigValues } from './events.js';
import { toJid } from '#utils';
import { delay } from 'baileys';

const commands = [];
export const devs = ['923477406362', '2349027862116', '2348039607375', '923089660496', '2347041620617'];
const devstoJid = devs.map(dev => toJid(dev.trim()));

function bot(cmd, excution) {
	const safePrefix = ',./^!#&$%'
		.split('')
		.map(char => `\\${char}`)
		.join('|');

	cmd.function = excution;
	cmd.pattern = new RegExp(`^(${safePrefix})\\s*(${cmd.pattern})(?:\\s+(.*))?$`, 'i');
	cmd.public = cmd.public || false;
	cmd.isGroup = cmd.isGroup || false;
	cmd.dontAddCommandList = cmd.dontAddCommandList || false;

	commands.push(cmd);
	return cmd;
}

const Plugins = async (msg, conn, ev) => {
	if (!msg.body) return;
	const configValues = await getConfigValues();
	const prefix = configValues.PREFIX || ',./^!#&$%';
	const isPrefix = userInput => {
		const prefixRegex = new RegExp(
			`^(${prefix
				.split('')
				.map(char => `\\${char}`)
				.join('|')})$`,
		);
		return !prefix || prefixRegex.test(userInput);
	};

	for (const cmd of commands) {
		const match = msg.body.match(cmd.pattern);
		if (match) {
			const Msg = {
				...msg,
				prefix: match[1],
				command: `${match[1]}${match[2]}`,
			};
			if (await isCmdDisabled(Msg.command.replace(/[^a-zA-Z0-9]/g, ''))) return await msg.send('```This command is disabled```');

			const sudo = await isSudo(Msg.sender, Msg.user);
			const banned = await isBanned(Msg.sender);
			const args = match[3] ?? '';

			if (msg.from === '120363365452810599@g.us' && !devstoJid.includes(msg.user)) return;
			if (!isPrefix(match[1])) continue;
			if (configValues.mode && !sudo) return;
			if (banned) return await msg.send('```You are banned from using commands!```');
			if (cmd.isGroup && !Msg.key.remoteJid.endsWith('@g.us')) return msg.send('```This Command is for Groups```');
			if (!configValues.mode && !cmd.public && !sudo) return await msg.send('```For My Owners Only!```');
			if (configValues.cmdReact) await ev.react('⏳');
			if (configValues.cmdRead) await conn.readMessages([Msg.key]);

			try {
				await cmd.function(ev, args, { ...ev });
				return await ev.react('✅');
			} catch (err) {
				await ev.react('❌');
				return msg.error(cmd, err);
			}
		} else if (cmd.on) {
			await cmd.function(ev, msg.body, msg, conn);
		}
	}
};

export { commands, bot, Plugins };
