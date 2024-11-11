import { bot } from '../lib/client/plugins.js';
import { inspect } from 'util';

bot(
	{
		on: 'text',
		dontAddCommandList: true,
	},
	async (message, match, m, client) => {
		if (!m.sudo) return;
		if (!message.text.startsWith('$ ')) return;

		const code = message.text.slice(2).trim().replace(/\$\s*/g, '');

		try {
			const result = await eval(`(async () => { ${code} })()`);

			const output =
				result === undefined
					? 'undefined'
					: result === null
					? 'null'
					: typeof result === 'function'
					? result.toString()
					: inspect(result, {
							depth: null,
							colors: false,
							maxArrayLength: null,
							maxStringLength: null,
					  });

			await message.sendReply(`*Result:*\n\`\`\`${output}\`\`\``);
		} catch (error) {
			const errorMessage = error.stack || error.message || String(error);
			await message.sendReply(`*Error:*\n\`\`\`${errorMessage}\`\`\``);
		}
	},
);
