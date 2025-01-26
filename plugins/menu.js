import { font } from '#bot';
import { config } from '#config';
import { bot, commands } from '#lib';
import { getConfig } from '#sql';
import { formatBytes, runtime } from '#utils';
import { platform, totalmem, freemem } from 'os';

bot(
  {
    pattern: 'menu',
    public: true,
    desc: 'Show All Commands',
    dontAddCommandList: true,
  },
  async (message) => {
    const { mode, PREFIX } = await getConfig();
    const cmds = commands.filter(
      (cmd) =>
        cmd.pattern && !cmd.dontAddCommandList && !cmd.pattern.toString().includes('undefined')
    ).length;
    let menuInfo = `\`\`\`
╭─── ${config.BOT_INFO.split(';')[1]} ────
│ Prefix: ${PREFIX}
│ Owner: ${config.BOT_INFO.split(';')[0]}		
│ Plugins: ${cmds}
│ Mode: ${mode ? 'private' : 'public'}
│ Uptime: ${runtime(process.uptime())}
│ Platform: ${platform()}
│ Memory: ${formatBytes(totalmem() - freemem())}
│ Day: ${new Date().toLocaleDateString('en-US', { weekday: 'long' })}
│ Date: ${new Date().toLocaleDateString('en-US')}
│ Date: ${new Date().toLocaleTimeString('en-US', { timeZone: config.TIME_ZONE })}
│ Version: ${config.VERSION}
╰─────────────\`\`\`\n
`;

    const commandsByType = commands
      .filter((cmd) => cmd.pattern && !cmd.dontAddCommandList)
      .reduce((acc, cmd) => {
        const type = cmd.type || 'Misc';
        if (!acc[type]) {
          acc[type] = [];
        }
        acc[type].push(cmd.pattern.toString().toLowerCase().split(/\W+/)[1]);
        return acc;
      }, {});

    const sortedTypes = Object.keys(commandsByType).sort();

    let totalCommands = 1;

    sortedTypes.forEach((type) => {
      const sortedCommands = commandsByType[type].sort();
      menuInfo += font.tiny(`╭──── *${type}* ────\n`);
      sortedCommands.forEach((cmd) => {
        menuInfo += font.tiny(`│${totalCommands}· ${cmd}\n`);
        totalCommands++;
      });
      menuInfo += font.tiny(`╰────────────\n`);
    });
    return await message.send(menuInfo.trim());
  }
);

bot(
  {
    pattern: 'list',
    public: true,
    desc: 'Show All Commands',
    dontAddCommandList: true,
  },
  async (message) => {
    let cmdsList = 'Command List\n\n';
    let cmdList = [];
    let cmd, desc;
    commands.map((command) => {
      if (command.pattern) cmd = command.pattern.toString().split(/\W+/)[1];
      desc = command.desc || false;
      if (!command.dontAddCommandList && cmd !== undefined) cmdList.push({ cmd, desc });
    });
    cmdList.sort((a, b) => a.cmd.localeCompare(b.cmd));
    cmdList.forEach(({ cmd, desc }, num) => {
      cmdsList += `${(num += 1)} ${cmd.toUpperCase()}\n`;
      if (desc) cmdsList += `${desc}\n\n`;
    });

    return await message.send(font.tiny(cmdsList));
  }
);
