import { bot, commands } from '#lib';
import { delcmd, getcmd, setcmd } from '#sql';

bot(
	{
		pattern: 'setcmd',
		public: false,
		desc: 'Set bot to excute cmds by using sticker',
		type: 'user',
	},
	async (message, match) => {
		if (!message.reply_message.sticker) return await message.send('_Reply to a sticker to set it as cmd and give me a vaild bot Command_');
		const cmds = commands.filter(cmd => cmd.pattern && !cmd.dontAddCommandList && !cmd.pattern.toString().includes('undefined'));
		if (!cmds) return await message.send('_Command not found_');
		const enable = await setcmd(match, message.data.quoted.message.stickerMessage.fileSha256);
		if (enable) return await message.send(`_Command ${match} set to sticker_`);
	},
);

bot(
	{
		pattern: 'delcmd',
		public: false,
		desc: 'Delete a Sticker Command',
		type: 'user',
	},
	async (message, match) => {
		if (!match) return await message.send('_Provide a command to delete_');
		const deleted = await delcmd(match);
		if (!deleted) return await message.send('_Command not found_');
		if (deleted) return await message.send(`_Command ${match} deleted_`);
	},
);

bot(
	{
		pattern: 'getcmd',
		public: false,
		desc: 'Get all Sticker Commands',
		type: 'user',
	},
	async message => {
		const cmds = await getcmd();
		if (!cmds) return await message.send('_No Sticker Commands Found_');
		return await message.send(`\`\`\`${cmds.map(cmd => cmd.cmd).join('\n')}\`\`\``);
	},
);
