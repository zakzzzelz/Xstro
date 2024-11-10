import { BOT_INFO, MODE, VERSION } from '../config.js';
import { commands, bot } from '../lib/client/plugins.js';
import { formatBytes, runtime } from '../lib/utils.js';
import { platform, totalmem, freemem } from 'os';
import { fancy } from '../lib/extras/font.js';

bot(
	{
		pattern: 'menu',
		desc: 'Show All Commands',
		dontAddCommandList: true,
	},
	async message => {
		let menuText = `*╭─ ${BOT_INFO.split(';')[1]} ───*
*│ User : ${message.pushName}*
*│ Plugins : ${commands.length}*
*│ Runtime : ${runtime(process.uptime())}*
*│ Mode : ${MODE}*
*│ Platform : ${platform()}*
*│ Memory : ${formatBytes(totalmem() - freemem())}*
*│ Version : ${VERSION}*
*╰────────────────*\n`;

		let commandCounter = 1;
		const categorized = commands
			.filter(cmd => cmd.pattern && !cmd.dontAddCommandList)
			.map(cmd => ({
				name: cmd.pattern.toString().split(/\W+/)[2],
				category: cmd.type?.toLowerCase() || 'misc',
			}))
			.reduce((acc, { name, category }) => {
				acc[category] = (acc[category] || []).concat(name);
				return acc;
			}, {});

		Object.keys(categorized).forEach(category => {
			menuText += `\n╭──〈 ${category} 〉────\n`;
			categorized[category].forEach(cmd => {
				menuText += `│▸ ${commandCounter}. ${cmd}\n`;
				commandCounter++;
			});
			menuText += `╰──────────────\n`;
		});
		return await message.send(fancy(menuText), { quoted: null });
	},
);

bot(
	{
		pattern: 'list',
		desc: 'Show All Commands',
		dontAddCommandList: true,
	},
	async (message, match, { prefix }) => {
		let menu = '*_xstro commands list_*\n\n';
		let cmdList = [];
		let cmd, desc;
		commands.map(command => {
			if (command.pattern) cmd = command.pattern.toString().split(/\W+/)[2];
			desc = command.desc || false;
			if (!command.dontAddCommandList && cmd !== undefined) cmdList.push({ cmd, desc });
		});
		cmdList.sort();
		cmdList.forEach(({ cmd, desc }, num) => {
			menu += `${(num += 1)} ${cmd.trim()}\n`;
			if (desc) menu += `${desc}\n\n`;
		});
		menu += ``;
		return await message.sendReply(fancy(menu), { contextInfo: { isForwarded: true, forwardingscore: 999 } });
	},
);
