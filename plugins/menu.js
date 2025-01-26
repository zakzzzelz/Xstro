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
    let menuInfo = `
╭─── ${config.BOT_INFO.split(';')[1]} ────
│ 𝙿𝚛𝚎𝚏𝚒𝚡: ${PREFIX}
│ 𝙾𝚠𝚗𝚎𝚛: ${config.BOT_INFO.split(';')[0]}		
│ 𝙿𝚕𝚞𝚐𝚒𝚗𝚜: ${cmds}
│ 𝙼𝚘𝚍𝚎: ${mode ? 'Private' : 'Public'}
│ 𝚄𝚙𝚝𝚒𝚖𝚎: ${runtime(process.uptime())}
│ 𝙿𝚕𝚊𝚝𝚏𝚘𝚛𝚖: ${platform()}
│ 𝙼𝚎𝚖𝚘𝚛𝚢: ${formatBytes(totalmem() - freemem())}
│ 𝙳𝚊𝚢: ${new Date().toLocaleDateString('en-US', { weekday: 'long' })}
│ 𝙳𝚊𝚝𝚎: ${new Date().toLocaleDateString('en-US')}
│ 𝚃𝚒𝚖𝚎: ${new Date().toLocaleTimeString('en-US', { timeZone: config.TIME_ZONE })}
│ 𝚅𝚎𝚛𝚜𝚒𝚘𝚗: ${config.VERSION}
╰─────────────\n`;

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
        menuInfo += font.tiny(`│${totalCommands}· _${cmd}_\n`);
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
