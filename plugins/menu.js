import config from '#config';
import { bot, commands, getConfigValues, formatBytes, runtime } from '#lib';
import { platform, totalmem, freemem } from 'os';
import { readFileSync } from 'fs';

bot(
	{
		pattern: 'menu',
		public: true,
		desc: 'Show All Commands',
		dontAddCommandList: true,
	},
	async message => {
		const { mode, PREFIX } = await getConfigValues();
		const long = String.fromCharCode(8206);
		const READ_MORE = long.repeat(4000);
		let intro = `\`\`\`╭─── ${config.BOT_INFO.split(';')[1]} ────
│ Prefix: ${PREFIX}
│ User: ${message.pushName}
│ Mode: ${mode ? 'private' : 'public'}
│ Uptime: ${runtime(process.uptime())}
│ Platform: ${platform()}
│ Memory: ${formatBytes(totalmem() - freemem())}
│ Day: ${new Date().toLocaleDateString('en-US', { weekday: 'long' })}
│ Date: ${new Date().toLocaleDateString('en-US')}
│ Date: ${new Date().toLocaleTimeString('en-US', { timeZone: config.TIME_ZONE })}
╰─────────────\`\`\`\n${READ_MORE}`;

		let nums = 1;
		const allCommands = commands
			.filter(cmd => cmd.pattern && !cmd.dontAddCommandList)
			.map(cmd => cmd.pattern.toString().toUpperCase().split(/\W+/)[2])
			.sort();

		let menuText = `\n\n${`\`\`\`XSTRO PATCH V${config.VERSION}\`\`\``} \n\n╭─────────\n`;
		allCommands.forEach(cmd => {
			menuText += `│\`\`\`${nums}· ${cmd}\`\`\`\n`;
			nums++;
		});
		menuText += `╰───────────\n`;
		const image = readFileSync('./media/intro.mp4');
		return await message.send(image, { caption: intro + menuText, gifPlayback: true, contextInfo: { forwardingScore: 1, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid: '120363376441437991@newsletter', newsletterName: 'xsᴛʀᴏ ᴍᴅ' } } });
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

		return await message.sendPaymentMessage(message.jid, 10, menu, message.user);
	},
);
