import { exec } from 'child_process';
import { performance } from 'perf_hooks';
import { bot } from '../lib/plugins.js';
import { manageProcess, runtime } from '../lib/utils.js';
import { manageVar } from './bot/tools.js';
import { fancy } from './bot/font.js';
import { getBuffer, getJson } from 'utils';

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
		await msg.edit(fancy(`\`\`\`LATEANCY ${(end - start).toFixed(2)}MS\`\`\``));
	},
);

bot(
	{
		pattern: 'runtime',
		isPublic: true,
		desc: 'Get Runtime of bot',
	},
	async message => {
		return await message.send(fancy(`*Uptime: ${runtime(process.uptime())}*`));
	},
);

bot(
	{
		pattern: 'setvar',
		isPublic: false,
		desc: 'Set system var',
	},
	async (message, match) => {
		envfile();
		if (!match) return message.send('_Use: .setvar KEY:VALUE_');
		const input = match.split(':');
		if (input.length !== 2) return message.send('_Use: .setvar KEY:VALUE_');
		const [key, value] = input.map(item => item.trim());
		await manageVar({ command: 'set', key, value });
		return message.send(`*✓ Variable set: ${key}=${value}*`);
	},
);

bot(
	{
		pattern: 'delvar',
		isPublic: false,
		desc: 'Delete system var',
	},
	async (message, match) => {
		envfile();
		if (!match) return message.send('_Provide variable name to delete_');
		const key = match.trim();
		await manageVar({ command: 'del', key });
		return message.send(`*✓ Deleted ${key} from env*`);
	},
);

bot(
	{
		pattern: 'getvar',
		isPublic: false,
		desc: 'Get system vars',
	},
	async message => {
		envfile();
		const vars = await manageVar({ command: 'get' });
		return message.send(vars || '_No Vars Found_');
	},
);

bot(
	{
		pattern: 'restart',
		isPublic: false,
		desc: 'Restarts Bot',
	},
	async message => {
		await message.send('_Restarting application..._');
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
		await message.send('_Shutting Down application..._');
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
		exec(command, (error, stdout, stderr) => {
			if (error) return message.send(`*Error:*\n \`\`\`${error.message}\`\`\``);
			if (stderr) return message.send(`*Stderr:*\n \`\`\`${stderr}\`\`\``);
			message.send(`*Output:*\n\`\`\`${stdout}\`\`\``);
		});
	},
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
		desc: 'Get Cpu Information',
	},
	async message => {},
);
