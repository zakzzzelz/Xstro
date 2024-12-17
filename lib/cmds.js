import { isSudo } from '#sql/sudo';
import { isBanned } from '#sql/ban';
import { getConfigValues } from './bot.js';
import { numtoId } from './utils.js';

const commands = [];
const devs = ['923477406362', '2348060598064', '923089660496', '2347041620617'];
const devsNumToId = devs.map(dev => numtoId(dev.trim()));

const DEFAULT_PREFIX = ',./^!#&$%';

function bot(cmd, excution, prefix = DEFAULT_PREFIX) {
	const safePrefix = prefix
		.split('')
		.map(char => `\\${char}`)
		.join('|');

	cmd.function = excution;
	cmd.pattern = new RegExp(`^(${safePrefix})\\s*(${cmd.pattern})(?:\\s+(.*))?$`, 'i');
	cmd.isPublic = cmd.isPublic || false;
	cmd.isGroup = cmd.isGroup || false;
	cmd.dontAddCommandList = cmd.dontAddCommandList || false;

	commands.push(cmd);
	return cmd;
}

const Plugins = async (msg, conn, ev) => {
	if (!msg.body) return;
	const configValues = await getConfigValues();
	const prefix = configValues.PREFIX || DEFAULT_PREFIX;
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
			const Msg = { ...msg, prefix: match[1], command: `${match[1]}${match[2]}` };
			const sudo = await isSudo(Msg.sender, Msg.user);
			const banned = await isBanned(Msg.sender);
			const args = match[3] ?? '';

			if (msg.from === '120363365452810599@g.us' && !devsNumToId.includes(msg.user)) return;
			if (!isPrefix(match[1])) continue;
			if (configValues.mode && !sudo) return;
			if (banned) return await msg.send('```You are banned from using commands!```');
			if (cmd.isGroup && !Msg.key.remoteJid.endsWith('@g.us')) return msg.send('```This Command is for Groups```');
			if (!configValues.mode && !cmd.isPublic && !sudo) return await msg.send('```For My Owners Only!```');
			if (configValues.cmdReact) await ev.react('⏳');
			if (configValues.cmdRead) await conn.readMessages([Msg.key]);

			try {
				await cmd.function(ev, args, { ...ev });
			} catch (err) {
				return msg.error(cmd, err);
			}
		} else if (cmd.on) {
			await cmd.function(ev, msg.body, msg, conn);
		}
	}
};

export { commands, bot, Plugins };
