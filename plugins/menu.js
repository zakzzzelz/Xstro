import config from '../config.js';
import { commands, bot } from '../lib/plugins.js';
import { formatBytes, runtime } from '../lib/utils.js';
import { platform, totalmem, freemem } from 'os';
import { fancy } from './bot/font.js';
import { readFileSync } from 'fs';

bot(
	{
		pattern: 'menu',
		isPublic: true,
		desc: 'Show All Commands (Dynamic Design)',
		dontAddCommandList: true,
	},
	async message => {
		let menuText = `\`\`\`
╭────────────────
│ ${config.BOT_INFO.split(';')[1]}
│ \t\t ${config.VERSION}
│ User: ${message.pushName}
│ Mode: ${config.MODE}
│ Uptime: ${runtime(process.uptime())}
│ Platform: ${platform()}
│ Plugins: ${commands.length}
│ Memory: ${formatBytes(totalmem() - freemem())}
╰────────────────
\`\`\`\n`;

		let commandCounter = 1;
		const allCommands = commands
			.filter(cmd => cmd.pattern && !cmd.dontAddCommandList)
			.map(cmd => cmd.pattern.toString().split(/\W+/)[2])
			.sort(); // Sort commands alphabetically

		menuText += `\t\t ${fancy(`COMMANDS LIST`)} \n\n\n╭────────────\n`;
		allCommands.forEach(cmd => {
			menuText += fancy(`│▸ ${commandCounter}. ${cmd}\n`);
			commandCounter++;
		});
		menuText += `╰──────────────\n`;

		const gif = readFileSync('./media/intro.mp4');
		return message.send(gif, { caption: menuText, gifPlayback: true });
	},
);
