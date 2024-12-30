import { bot } from '#lib';
import { isSudo } from '#sql';

bot(
	{
		on: 'text',
		dontAddCommandList: true,
	},
	async (message, match, _, client) => {
		if (!message.text || !message.text.startsWith('$ ') || !(await isSudo(message.sender, message.user))) return;

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
					: JSON.stringify(
							result,
							(key, value) => {
								if (value === undefined) return 'undefined';
								if (value === null) return 'null';
								if (typeof value === 'function') return value.toString();
								return value;
							},
							2,
					  );

			return await message.send(`*Result:*\n\`\`\`${output}\`\`\``, {
				type: 'text',
			});
		} catch (error) {
			const errorMessage = error.stack || error.message || String(error);
			await message.send(`*Error:*\n\`\`\`${errorMessage}\`\`\``);
		}
	},
);

bot(
	{
		pattern: 'eval ?(.*)',
		public: false,
		desc: 'Evaluate code',
		type: 'system',
	},
	async (message, match) => {
		const src_code = match || message.reply_message?.text;
		if (!src_code) return message.send('_Provide code to evaluate_');
		const code = src_code.trim().replace(/\$\s*/g, '');
		try {
			const result = await eval(`(async () => { ${code} })()`);
			const output =
				result === undefined
					? 'undefined'
					: result === null
					? 'null'
					: typeof result === 'function'
					? result.toString()
					: JSON.stringify(
							result,
							(key, value) => {
								if (value === undefined) return 'undefined';
								if (value === null) return 'null';
								if (typeof value === 'function') return value.toString();
								return value;
							},
							2,
					  );

			return await message.send(`*Result:*\n\`\`\`${output}\`\`\``, {
				type: 'text',
			});
		} catch (error) {
			const errorMessage = error.stack || error.message || String(error);
			await message.send(`*Error:*\n\`\`\`${errorMessage}\`\`\``);
		}
	},
);
