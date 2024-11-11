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
		const code = message.text.slice(2).trim();

		const executeCode = async code => {
			try {
				const processedCode = code
					.replace(/\$\s*(\w+)\s*/g, '$1')
					.replace(/```js/g, '')
					.replace(/```/g, '');

				const wrapped = `
                (async () => {
                    try {
                        ${processedCode.includes('return') ? processedCode : `return ${processedCode}`}
                    } catch (e) {
                        return e;
                    }
                })()
            `;

				const result = await eval(wrapped);

				if (result instanceof Error) throw result;
				if (result === undefined) return 'undefined';
				if (result === null) return 'null';

				return typeof result === 'function'
					? result.toString()
					: inspect(result, {
							depth: null,
							colors: false,
							maxArrayLength: null,
							maxStringLength: null,
					  });
			} catch (error) {
				throw error;
			}
		};

		try {
			const result = await executeCode(code);
			await message.sendReply(`*Result:*\n\`\`\`${result}\`\`\``);
		} catch (error) {
			const errorMessage = error.stack || error.message || String(error);
			await message.sendReply(`*Error:*\n\`\`\`${errorMessage}\`\`\``);
		}
	},
);
