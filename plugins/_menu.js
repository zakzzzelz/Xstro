import { commands, bot } from "../lib/plugins.js";
import { clockString } from "../lib/utils.js";
import { hostname } from "os";

bot(
	{
		pattern: "menu",
		desc: "Show All Commands",
		dontAddCommandList: true,
		type: "user",
	},
	async (message, match) => {
		if (match) {
			for (let i of commands) {
				if (i.pattern instanceof RegExp && i.pattern.test(message.prefix + match)) {
					const cmdName = i.pattern.toString().split(/\W+/)[1];
					message.sendReply(`\`\`\`Command: ${message.prefix}${cmdName.trim()}
Description: ${i.desc}\`\`\``);
				}
			}
		} else {
			let { prefix } = message;
			let [date, time] = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }).split(",");
			let menu = `╭━━━━━ᆫ vbot ᄀ━━━
┃ ⎆  *OWNER*:  astro
┃ ⎆  *PREFIX*: ${prefix}
┃ ⎆  *HOST NAME*: ${hostname().split("-")[0]}
┃ ⎆  *DATE*: ${date}
┃ ⎆  *TIME*: ${time}
┃ ⎆  *COMMANDS*: ${commands.length} 
┃ ⎆  *UPTIME*: ${clockString(process.uptime())} 
╰━━━━━━━━━━━━━━━\n`;
			let cmnd = [];
			let cmd;
			let category = [];
			commands.map((command, num) => {
				if (command.pattern instanceof RegExp) {
					cmd = command.pattern.toString().split(/\W+/)[1];
				}

				if (!command.dontAddCommandList && cmd !== undefined) {
					let type = command.type ? command.type.toLowerCase() : "misc";

					cmnd.push({ cmd, type });

					if (!category.includes(type)) category.push(type);
				}
			});
			cmnd.sort();
			category.sort().forEach((cmmd) => {
				menu += `\n\t⦿---- *${cmmd.toUpperCase()}* ----⦿\n`;
				let comad = cmnd.filter(({ type }) => type == cmmd);
				comad.forEach(({ cmd }) => {
					menu += `\n⛥  _${cmd.trim()}_ `;
				});
				menu += `\n`;
			});

			menu += `\n`;
			menu += `_🔖Send ${prefix}menu <command name> to get detailed information of a specific command._\n*📍Eg:* _${prefix}menu plugin_`;
			return await message.sendMessage(message.jid, menu);
		}
	},
);

bot(
	{
		pattern: "list",
		desc: "Show All Commands",
		type: "user",
		dontAddCommandList: true,
	},
	async (message, match, { prefix }) => {
		let menu = "\t\t```Command List```\n";

		let cmnd = [];
		let cmd, desc;
		commands.map((command) => {
			if (command.pattern) {
				cmd = command.pattern.toString().split(/\W+/)[1];
			}
			desc = command.desc || false;

			if (!command.dontAddCommandList && cmd !== undefined) {
				cmnd.push({ cmd, desc });
			}
		});
		cmnd.sort();
		cmnd.forEach(({ cmd, desc }, num) => {
			menu += `\`\`\`${(num += 1)} ${cmd.trim()}\`\`\`\n`;
			if (desc) menu += `Use: \`\`\`${desc}\`\`\`\n\n`;
		});
		menu += ``;
		return await message.sendReply(menu);
	},
);
