import { performance } from 'perf_hooks';
import { bot } from '#lib';
import { manageProcess, runtime } from '#utils';
import { getBuffer, getJson } from 'xstro-utils';
import os from 'os';
import { font } from '#bot';
import { delay } from 'baileys';

bot(
  {
    pattern: 'ping',
    public: true,
    desc: 'Get Performance',
    type: 'system',
  },
  async (message) => {
    const start = performance.now();
    const msg = await message.send('Testing Speed...');
    const end = performance.now();
    await msg.edit(font.tiny(`Pong! ${(end - start).toFixed(2)}`));
  }
);

bot(
  {
    pattern: 'runtime',
    public: true,
    desc: 'Get Runtime of bot',
    type: 'system',
  },
  async (message) => {
    return await message.send(font.tiny(`Uptime: ${runtime(process.uptime())}`));
  }
);

bot(
  {
    pattern: 'restart',
    public: false,
    desc: 'Restarts Bot',
    type: 'system',
  },
  async (message) => {
    await message.send('```Restarting bot```');
    manageProcess('restart');
  }
);

bot(
  {
    pattern: 'shutdown',
    public: false,
    desc: 'Off Bot',
    type: 'system',
  },
  async (message) => {
    await message.send('```Shutting down bot```');
    manageProcess('stop');
  }
);

bot(
  {
    pattern: 'logout',
    public: false,
    desc: 'End your Xstro Session',
    type: 'system',
  },
  async (message) => {
    await message.send('_logging out_');
    await delay(3000);
    await message.client.logout();
  }
);

bot(
  {
    pattern: 'fetch',
    public: true,
    desc: 'Get data from internet',
    type: 'system',
  },
  async (message, match) => {
    if (!match) return message.send('_I need a URL_');
    const [mode, url] = match.split(';');
    if (!url) return message.send('_Use: mode;url_');
    const data = mode === 'json' ? JSON.stringify(await getJson(url)) : await getBuffer(url);
    return await message.send(data, mode === 'json' ? { type: 'text' } : undefined);
  }
);

bot(
  {
    pattern: 'cpu',
    public: false,
    desc: 'Get CPU Information',
    type: 'system',
  },
  async (message) => {
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
  }
);
