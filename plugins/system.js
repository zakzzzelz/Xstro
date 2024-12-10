import { execSync } from 'child_process';
import { performance } from 'perf_hooks';
import { bot } from '../lib/plugins.js';
import { manageProcess, runtime } from '../lib/utils.js';
import { getBuffer, getJson } from 'utils';
import os from 'os';

bot(
	{
		pattern: 'ping',
		isPublic: true,
		desc: 'Get Performance',
	},
	async message => {
		const start = performance.now();
		const msg = await message.send('Testing Speed...');
		const end = performance.now();
		await msg.edit(`\`\`\`LATEANCY ${(end - start).toFixed(2)}MS\`\`\``);
	},
);

bot(
	{
		pattern: 'runtime',
		isPublic: true,
		desc: 'Get Runtime of bot',
	},
	async message => {
		return await message.send(`\`\`\`Runtime: ${runtime(process.uptime())}\`\`\``);
	},
);

bot(
	{
		pattern: 'restart',
		isPublic: false,
		desc: 'Restarts Bot',
	},
	async message => {
		await message.send('```Restarting bot```');
		manageProcess('restart');
	},
);

bot(
	{
		pattern: 'shutdown',
		isPublic: false,
		desc: 'Off Bot',
	},
	async message => {
		await message.send('```Shutting down bot```');
		manageProcess();
	},
);

bot(
  {
    pattern: 'shell ?(.*)',
    isPublic: false,
    desc: 'Run shell commands',
  },
  async (message, match) => {
    if (!match) return message.send('_Provide a shell command to run_');
    const command = match.trim();

    try {
      const stdout = execSync(command, { encoding: 'utf8' });
      message.send(`*Output:*\n\`\`\`${stdout}\`\`\``);
    } catch (error) {
      if (error.stderr) {
        message.send(`*Stderr:*\n\`\`\`${error.stderr}\`\`\``);
      } else if (error.message.includes('command not found')) {
        message.send(`*Error:*\n\`\`\`Command not found\`\`\``);
      } else {
        message.send(`*Error:*\n\`\`\`${error.message}\`\`\``);
      }
    }
  }
);


bot(
	{
		pattern: 'logout',
		isPublic: false,
		desc: 'End your Xstro Session',
	},
	async (message, match) => {
		if (!match) return message.send(`*Hello ${message.pushName} this isn't the goo, goo ga ga, this command will logout you out of your Xstro Session, and you will be unable to use this bot until you get a new session*\nAre you sure you want to continue with this decision, then type\n${message.prefix}logout confirm`);
		if (match === 'confirm') {
			message.send('_logging out_');
			await message.client.logout();
		} else {
			message.send('_that not right hmm_');
		}
	},
);

bot(
	{
		pattern: 'fetch',
		isPublic: true,
		desc: 'Get data from internet',
	},
	async (message, match) => {
		if (!match) return message.send('_I need a URL_');

		const [mode, url] = match.split(';');

		if (!url) return message.send('_Invalid format. Use: mode;url_');

		if (mode === 'json') {
			try {
				const data = await getJson(url);
				await message.send(JSON.stringify(data, null, 2), { type: 'text' });
			} catch {
				await message.send('_Failed to fetch JSON data._');
			}
		} else if (mode === 'buffer') {
			try {
				const buffer = await getBuffer(url);
				await message.send(buffer);
			} catch {
				await message.send('_Failed to fetch buffer data._');
			}
		} else {
			await message.send('_Invalid mode. Use "json" or "buffer"._');
		}
	},
);

bot(
	{
		pattern: 'cpu',
		isPublic: false,
		desc: 'Get CPU Information',
	},
	async message => {
		const cpus = os.cpus();
		const coreCount = cpus.length;
		const model = cpus[0].model
			.replace(/\s+\(.*\)/g, '')
			.replace(/CPU|Processor/gi, '')
			.trim();

		const averageSpeed = Math.round(cpus.reduce((sum, cpu) => sum + cpu.speed, 0) / coreCount);

		const response = `CPU Information:
Model: ${model}
Cores: ${coreCount}
Average Speed: ${averageSpeed} MHz
Architecture: ${os.arch()}
Platform: ${os.platform()}
Uptime: ${Math.floor(os.uptime() / 60)} minutes`;

		await message.send('```' + response + '```');
	},
);
