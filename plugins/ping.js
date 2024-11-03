import { performance } from 'perf_hooks';
import { bot } from '../lib/plugins.js';

bot(
    {
        pattern: 'ping',
        alias: 'speed',
        desc: 'Get Performance',
        type: 'system'
    },
    async (message) => {
        const start = performance.now();
        const msg = await message.sendReply('Testing Speed...');
        const end = performance.now();
        await msg.edit(`*Response Speed:* ${(end - start).toFixed(2)}ms`);
    }
);