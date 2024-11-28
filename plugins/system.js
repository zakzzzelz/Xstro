import fs from 'fs';
import path, { join, basename, extname } from 'path';
import axios from 'axios';
import { exec } from 'child_process';
import { performance } from 'perf_hooks';
import { bot } from '../lib/handler.js';
import { extractUrlFromMessage, manageProcess, runtime } from '../lib/utils.js';
import { addPlugin, getPlugins, removePlugin } from '../lib/sql/plugins.js';
import { manageVar } from './client/env.js';
import { fancy } from './client/font.js';

const envFilePath = path.join(process.cwd(), '.env');
const envfile = () => {
  if (!fs.existsSync(envFilePath)) fs.writeFileSync(envFilePath, '', 'utf-8');
};

bot(
  {
    pattern: 'ping',
    isPublic: true,
    desc: 'Get Performance',
    type: 'system',
  },
  async (message) => {
    const start = performance.now();
    const msg = await message.sendReply('Testing Speed...');
    const end = performance.now();
    await msg.edit(`*_Speed ${(end - start).toFixed(2)}ms_*`);
  }
);

bot(
  {
    pattern: 'runtime',
    isPublic: true,
    desc: 'Get Runtime of bot',
    type: 'system',
  },
  async (message) => {
    return await message.sendReply(fancy(`*Uptime: ${runtime(process.uptime())}*`));
  }
);

bot(
  {
    pattern: 'install ?(.*)',
    isPublic: false,
    desc: 'Installs a Plugin',
    type: 'system',
  },
  async (message, match) => {
    const pluginUrl = extractUrlFromMessage(match.trim() || message.reply_message?.text);
    if (!pluginUrl.startsWith('https://gist.githubusercontent.com'))
      return message.sendReply('_Provide a valid Plugin URL_');

    const pluginName = `${basename(pluginUrl, extname(pluginUrl))}.js`;
    const existingPlugins = await getPlugins();
    if (existingPlugins.some((plugin) => plugin.name === pluginName))
      return message.sendReply('_Plugin already installed_');

    const pluginPath = join('plugins', pluginName);
    const response = await axios.get(pluginUrl, { responseType: 'arraybuffer' });
    fs.writeFileSync(pluginPath, response.data);
    await addPlugin(pluginName);
    message.sendReply(`_${pluginName} plugin installed_`);
  }
);

bot(
  {
    pattern: 'delplugin ?(.*)',
    isPublic: false,
    desc: 'Deletes a Plugin',
    type: 'system',
  },
  async (message, match) => {
    if (!match) return message.sendReply('_Provide an installed plugin name_');
    const baseName = match.trim();
    const pluginName = `${baseName}.js`;

    const deleted = await removePlugin(pluginName);
    if (!deleted) return message.sendReply('_Plugin not found_');

    const pluginPath = join('plugins', pluginName);
    if (fs.existsSync(pluginPath)) fs.unlinkSync(pluginPath);
    message.sendReply(`_${pluginName} plugin uninstalled_`);
  }
);

bot(
  {
    pattern: 'getplugins',
    isPublic: false,
    desc: 'Lists all installed plugins',
    type: 'system',
  },
  async (message) => {
    const plugins = await getPlugins();
    const pluginList =
      plugins.length > 0
        ? `_Plugins Installed:_\n${plugins.map((plugin) => plugin.name).join('\n')}`
        : '_No plugins installed_';
    message.sendReply(pluginList);
  }
);

bot(
  {
    pattern: 'setvar',
    isPublic: false,
    desc: 'Set system var',
    type: 'system',
  },
  async (message, match) => {
    envfile();
    if (!match) return message.sendReply('_Use: .setvar KEY:VALUE_');
    const input = match.split(':');
    if (input.length !== 2) return message.sendReply('_Use: .setvar KEY:VALUE_');
    const [key, value] = input.map((item) => item.trim());
    await manageVar({ command: 'set', key, value });
    return message.sendReply(`*✓ Variable set: ${key}=${value}*`);
  }
);

bot(
  {
    pattern: 'delvar',
    isPublic: false,
    desc: 'Delete system var',
    type: 'system',
  },
  async (message, match) => {
    envfile();
    if (!match) return message.sendReply('_Provide variable name to delete_');
    const key = match.trim();
    await manageVar({ command: 'del', key });
    return message.sendReply(`*✓ Deleted ${key} from env*`);
  }
);

bot(
  {
    pattern: 'getvar',
    isPublic: false,
    desc: 'Get system vars',
    type: 'system',
  },
  async (message) => {
    envfile();
    const vars = await manageVar({ command: 'get' });
    return message.sendReply(vars || '_No Vars Found_');
  }
);

bot(
  {
    pattern: 'restart',
    isPublic: false,
    desc: 'Restarts Bot',
    type: 'system',
  },
  async (message) => {
    await message.sendReply('_Restarting application..._');
    await manageProcess('restart');
  }
);

bot(
  {
    pattern: 'shutdown',
    isPublic: false,
    desc: 'Off Bot',
    type: 'system',
  },
  async (message) => {
    await message.sendReply('_Shutting Down application..._');
    await manageProcess('stop');
  }
);

bot(
  {
    pattern: 'eval ?(.*)',
    isPublic: false,
    desc: 'Evaluate code',
    type: 'system',
  },
  async (message, match) => {
    if (!match) return message.sendReply('_Provide code to evaluate_');
    try {
      const result = eval(match);
      message.sendReply(`Result: \`${result}\``);
    } catch (error) {
      message.sendReply(`Error: ${error.message}`);
    }
  }
);

bot(
  {
    pattern: 'shell ?(.*)',
    isPublic: false,
    desc: 'Run shell commands',
    type: 'system',
  },
  async (message, match) => {
    if (!match) return message.sendReply('_Provide a shell command to run_');
    const command = match.trim();
    exec(command, (error, stdout, stderr) => {
      if (error) return message.sendReply(`*Error:*\n \`\`\`${error.message}\`\`\``);
      if (stderr) return message.sendReply(`*Stderr:*\n \`\`\`${stderr}\`\`\``);
      message.sendReply(`*Output:*\n\`\`\`${stdout}\`\`\``);
    });
  }
);
