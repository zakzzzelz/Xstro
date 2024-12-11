import config from '../config.js';
import { commands, bot } from '../lib/exec.js';
import { formatBytes, runtime } from '../lib/utils.js';
import { platform, totalmem, freemem } from 'os';
import { fancy } from './bot/font.js';

bot(
	{
		pattern: 'menu',
		isPublic: true,
		desc: 'Show All Commands',
		dontAddCommandList: true,
	},
	async message => {
		let menuText = `╭─── ${config.BOT_INFO.split(';')[1]} ────
│ User: ${message.pushName}
│ Mode: ${config.MODE}
│ Uptime: ${runtime(process.uptime())}
│ Platform: ${platform()}
│ Plugins: ${commands.length}
│ Memory: ${formatBytes(totalmem() - freemem())}
│ Day: ${new Date().toLocaleDateString('en-US', { weekday: 'long' })}
│ Date: ${new Date().toLocaleDateString('en-US')}
│ Date: ${new Date().toLocaleTimeString('en-US', { timeZone: config.TIME_ZONE })}
╰─────────────`;

		let nums = 1;
		const allCommands = commands
			.filter(cmd => cmd.pattern && !cmd.dontAddCommandList)
			.map(cmd => cmd.pattern.toString().toUpperCase().split(/\W+/)[2])
			.sort();

		menuText += `\n\n${`COMMANDS LIST V${config.VERSION}`} \n\n╭─────────\n`;
		allCommands.forEach(cmd => {
			menuText += `│${nums}· ${cmd}\n`;
			nums++;
		});
		menuText += `╰───────────\n`;

		return message.send(fancy(menuText.trim().trim().trim()));
	},
);

bot(
	{
		pattern: 'list',
		isPublic: true,
		desc: 'Show All Commands',
		dontAddCommandList: true,
	},
	async message => {
		let menu = 'XSTRO HELP LIST\n\n';
		let cmdList = [];
		let cmd, desc;
		commands.map(command => {
			if (command.pattern) cmd = command.pattern.toString().split(/\W+/)[2];
			desc = command.desc || false;
			if (!command.dontAddCommandList && cmd !== undefined) cmdList.push({ cmd, desc });
		});
		cmdList.sort((a, b) => a.cmd.localeCompare(b.cmd));
		cmdList.forEach(({ cmd, desc }, num) => {
			menu += `${(num += 1)} ${cmd.trim()}\n`;
			if (desc) menu += `${desc}\n\n`;
		});

		return await message.send(`\`\`\`${menu.trim().trim().trim()}\`\`\``);
	},
);
