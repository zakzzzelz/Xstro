import config from '../config.js';
import { commands, bot } from '../lib/cmds.js';
import { formatBytes, runtime } from '../lib/utils.js';
import { getConfigValues } from '../lib/bot.js';
import { platform, totalmem, freemem } from 'os';
import { fancy } from '../utils/fancy.js';
import { readFileSync } from 'fs';

bot(
	{
		pattern: 'menu',
		isPublic: true,
		desc: 'Show All Commands',
		dontAddCommandList: true,
	},
	async message => {
		const { mode } = await getConfigValues();
		let menuText = `╭─── ${config.BOT_INFO.split(';')[1]} ────
│ User: ${message.pushName}
│ Mode: ${mode ? 'public' : 'private'}
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
		menuText += `╰───────────\n\n> Some Command Are Hidden from the Menu`;
		const image = readFileSync('./media/intro.mp4');
		return await message.send(image, { caption: fancy(menuText), gifPlayback: true, contextInfo: { forwardingScore: 1, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid: '120363376441437991@newsletter', newsletterName: 'xsᴛʀᴏ ᴍᴅ' } } });
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
