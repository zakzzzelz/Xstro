import config from '../config.js';
import { commands, bot } from '../lib/handler.js';
import { formatBytes, runtime } from '../lib/utils.js';
import { platform, totalmem, freemem } from 'os';
import { fancy } from './client/font.js';

bot(
  {
    pattern: 'menu',
    isPublic: true,
    desc: 'Show All Commands',
    dontAddCommandList: true,
  },
  async (message) => {
    let menuText = `\`\`\`╭─ ${config.BOT_INFO.split(';')[1]} ───
│ User: ${message.pushName}
│ Mode: ${config.MODE}
│ Uptime: ${runtime(process.uptime())}
│ Platform: ${platform()}
│ Plugins: ${commands.length}
│ Memory: ${formatBytes(totalmem() - freemem())}
│ Version: ${config.VERSION}
╰────────────────\`\`\`\n`;

    let commandCounter = 1;
    const categorized = commands
      .filter((cmd) => cmd.pattern && !cmd.dontAddCommandList)
      .map((cmd) => ({
        name: cmd.pattern.toString().split(/\W+/)[2],
        category: cmd.type?.toLowerCase() || 'misc',
      }))
      .reduce((acc, { name, category }) => {
        acc[category] = (acc[category] || []).concat(name);
        return acc;
      }, {});

    Object.keys(categorized).forEach((category) => {
      menuText += fancy(`\n╭──〈 *${category}* 〉────\n`);
      categorized[category].forEach((cmd) => {
        menuText += fancy(`│▸ ${commandCounter}. ${cmd}\n`);
        commandCounter++;
      });
      menuText += fancy(`╰──────────────\n`);
    });

    return await message.send(menuText, { quoted: false });
  }
);

bot(
  {
    pattern: 'list',
    isPublic: true,
    desc: 'Show All Commands',
    dontAddCommandList: true,
  },
  async (message) => {
    let menu = '*_xstro commands list_*\n\n';
    let cmdList = [];
    let cmd, desc;
    commands.map((command) => {
      if (command.pattern) cmd = command.pattern.toString().split(/\W+/)[2];
      desc = command.desc || false;
      if (!command.dontAddCommandList && cmd !== undefined) cmdList.push({ cmd, desc });
    });
    cmdList.sort((a, b) => a.cmd.localeCompare(b.cmd));
    cmdList.forEach(({ cmd, desc }, num) => {
      menu += `${(num += 1)} ${cmd.trim()}\n`;
      if (desc) menu += `${desc}\n\n`;
    });

    return await message.sendReply(fancy(menu), {
      contextInfo: { isForwarded: true, forwardingscore: 999 },
    });
  }
);
