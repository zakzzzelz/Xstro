import { isSudo, isBanned, isCmdDisabled } from '#sql';
import { getConfigValues } from './events.js';
import { isPrefix, toJid } from '#utils';
import { isJidGroup } from 'baileys';

const commands = [];

function bot(cmd, func) {
	const safePrefix = ',./^!#&$%'
		.split('')
		.map(char => `\\${char}`)
		.join('|');

	cmd.function = func;
	cmd.pattern = new RegExp(`^(${safePrefix})\\s*(${cmd.pattern})(?:[\\s\\S]+)?$`, 'i');
	cmd.public = cmd.public || false;
	cmd.isGroup = cmd.isGroup || false;
	cmd.dontAddCommandList = cmd.dontAddCommandList || false;

	commands.push(cmd);
	return cmd;
}

const Plugins = async (msg, client, Message) => {
	if (!msg.body) return;
	const db = await getConfigValues();

	for (const cmd of commands) {
		const match = msg.body.match(cmd.pattern);
		if (match) {
			const Msg = {
				...msg,
				prefix: match[1],
				command: `${match[1]}${match[2]}`
			};
			if (
				isJidGroup(msg.from) &&
				db.disablegc &&
				`${match[1]}${match[2]}` !== `${match[1]}disablegc`
			)
				return;
			if (!isJidGroup(msg.from) && db.disabledm && msg.from !== msg.user) return;
			if (await isCmdDisabled(Msg.command.replace(/[^a-zA-Z0-9]/g, '')))
				return await msg.send('```This command is disabled```');

			const sudo = await isSudo(msg.sender, msg.user);
			const banned = await isBanned(msg.sender);
			const args = match[3] ?? '';

			if (!isPrefix(match[1])) continue;
			if (db.mode && !sudo) return;
			if (banned) return await msg.send('```You are banned from using commands!```');
			if (cmd.isGroup && !isJidGroup(msg.from)) return msg.send('```This Command is for Groups```');
			if (!db.mode && !cmd.public && !sudo) return await msg.send('```For My Owners Only!```');
			if (db.cmdReact) await Message.react('⏳');
			if (db.cmdRead) await client.readMessages([msg.key]);

			try {
				await cmd.function(Message, args, { ...Message });
				return await Message.react('✅');
			} catch (err) {
				await Message.react('❌');
				return msg.error(cmd, err);
			}
		} else if (cmd.on) {
			await cmd.function(Message, msg.body, msg, client);
		}
	}
};

export { commands, bot, Plugins };
