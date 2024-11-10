import { performance } from 'perf_hooks';
import { bot } from '../lib/client/plugins.js';

bot(
	{
		pattern: 'ping',
		isPublic: true,
		desc: 'Get Performance',
		type: 'system',
	},
	async message => {
		const start = performance.now();
		const msg = await message.sendReply('Testing Speed...');
		const end = performance.now();
		await msg.edit(`*_Speed ${(end - start).toFixed(2)}ms_*`);
	},
);
