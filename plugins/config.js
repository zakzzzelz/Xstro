import { bot } from '../lib/cmds.js';
import { getConfig, updateConfig } from '../sql/config.js';

bot(
	{
		pattern: 'myconfig',
		isPublic: false,
		desc: 'Get Database configurations',
	},
	async message => {
		const db_list = await getConfig();
		const { autoRead, autoStatusRead, cmdReact, mode } = db_list;
		return await message.send(`\`\`\`DATABASE CONFIGURATIONS\nAutoRead: ${autoRead}\nAutoReadStatus: ${autoStatusRead}\nCmdReact: ${cmdReact}\nMode: ${mode ? 'public' : 'private'}\`\`\``);
	},
);

bot(
	{
		pattern: 'autoread',
		isPublic: false,
		desc: 'Set bot to automatically read messages',
	},
	async (message, match) => {
		const newValue = match === 'on' ? true : match === 'off' ? false : null;
		if (newValue === null) return await message.send('_Use "on" or "off"_');
		const dbConfig = await getConfig();
		if (dbConfig.autoRead === newValue) return await message.send(`_AutoRead is already set to ${newValue ? 'on' : 'off'}._`);

		await updateConfig('autoRead', newValue);
		return await message.send(`_AutoRead set to ${newValue ? 'on' : 'off'}._`);
	},
);

bot(
	{
		pattern: 'autostatus',
		isPublic: false,
		desc: 'Set bot to automatically read status',
	},
	async (message, match) => {
		const newValue = match === 'on' ? true : match === 'off' ? false : null;
		if (newValue === null) return await message.send('_Use "on" or "off"_');
		const dbConfig = await getConfig();
		if (dbConfig.autoStatusRead === newValue) return await message.send(`_AutoStatusRead is already set to ${newValue ? 'on' : 'off'}._`);

		await updateConfig('autoStatusRead', newValue);
		return await message.send(`_AutoStatusRead set to ${newValue ? 'on' : 'off'}._`);
	},
);

bot(
	{
		pattern: 'mode',
		isPublic: false,
		desc: 'Set bot Mode private or public',
	},
	async (message, match) => {
		const newValue = match === 'private' ? true : match === 'public' ? false : null;
		if (newValue === null) return await message.send('_Use "private" or "public"_');
		const dbConfig = await getConfig();
		if (dbConfig.mode === newValue) return await message.send(`_Mode is already set to ${newValue ? 'private' : 'public'}._`);

		await updateConfig('mode', newValue);
		return await message.send(`_Mode set to ${newValue ? 'private' : 'public'}._`);
	},
);

bot(
	{
		pattern: 'cmdreact',
		isPublic: false,
		desc: 'Set bot to react to Cmds',
	},
	async (message, match) => {
		const newValue = match === 'on' ? true : match === 'off' ? false : null;
		if (newValue === null) return await message.send('_Use "on" or "off"_');
		const dbConfig = await getConfig();
		if (dbConfig.cmdReact === newValue) return await message.send(`_CmdReact is already set to ${newValue ? 'on' : 'off'}._`);

		await updateConfig('cmdReact', newValue);
		return await message.send(`_CmdReact set to ${newValue ? 'on' : 'off'}._`);
	},
);

bot(
	{
		pattern: 'cmdread',
		isPublic: false,
		desc: 'Set bot to read cmds',
	},
	async (message, match) => {
		const newValue = match === 'on' ? true : match === 'off' ? false : null;
		if (newValue === null) return await message.send('_Use "on" or "off"_');
		const dbConfig = await getConfig();
		if (dbConfig.cmdRead === newValue) return await message.send(`_cmdRead is already set to ${newValue ? 'on' : 'off'}._`);

		await updateConfig('cmdReact', newValue);
		return await message.send(`_CmdRead set to ${newValue ? 'on' : 'off'}._`);
	},
);
