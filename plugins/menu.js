import config from '#config';
import { bot, commands, getConfigValues } from '#lib';
import { formatBytes, runtime } from '#utils';
import { platform, totalmem, freemem } from 'os';

bot(
	{
		pattern: 'menu',
		public: true,
		desc: 'Show All Commands',
		dontAddCommandList: true,
	},
	async message => {
		const { mode, PREFIX } = await getConfigValues();
		const cmds = commands.filter(cmd => cmd.pattern && !cmd.dontAddCommandList && !cmd.pattern.toString().includes('undefined')).length;
		let intro = `\`\`\`╭─── ${config.BOT_INFO.split(';')[1]} ────
│ Prefix: ${PREFIX}
│ Plugins: ${cmds}
│ Mode: ${mode ? 'private' : 'public'}
│ Uptime: ${runtime(process.uptime())}
│ Platform: ${platform()}
│ Memory: ${formatBytes(totalmem() - freemem())}
│ Day: ${new Date().toLocaleDateString('en-US', { weekday: 'long' })}
│ Date: ${new Date().toLocaleDateString('en-US')}
│ Date: ${new Date().toLocaleTimeString('en-US', {
			timeZone: config.TIME_ZONE,
		})}
│ Version: ${config.VERSION}
╰─────────────\`\`\`\n`;

		const commandsByType = commands
			.filter(cmd => cmd.pattern && !cmd.dontAddCommandList)
			.reduce((acc, cmd) => {
				const type = cmd.type || 'Misc';
				if (!acc[type]) {
					acc[type] = [];
				}
				acc[type].push(cmd.pattern.toString().toUpperCase().split(/\W+/)[2]);
				return acc;
			}, {});

		const sortedTypes = Object.keys(commandsByType).sort();

		let menuText = ``;
		let totalCommands = 1;

		sortedTypes.forEach(type => {
			const sortedCommands = commandsByType[type].sort();
			menuText += `\`\`\`╭──── ${type.toUpperCase()} ────\`\`\`\n`;
			sortedCommands.forEach(cmd => {
				menuText += `│\`\`\`${totalCommands}· ${cmd}\`\`\`\n`;
				totalCommands++;
			});
			menuText += `╰────────────\n`;
		});
		return await message.send(intro + menuText, { contextInfo: { externalAdReply: { showAdAttribution: true } } });
	},
);

bot(
	{
		pattern: 'list',
		public: true,
		desc: 'Show All Commands',
		dontAddCommandList: true,
	},
	async message => {
		let menu = 'Commnad Help\n\n';
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

		return await message.send(`\`\`\`${menu}\`\`\``);
	},
);
