import { bot } from '#lib';

bot(
  {
    pattern: 'eval ?(.*)',
    public: false,
    desc: 'Evaluate code',
    type: 'system',
  },
  async (message, match) => {
    const code = match || message.reply_message?.text;
    if (!code) return message.send('_Provide code to evaluate_');
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
                  2
                );

      return await message.send(`*Result:*\n\`\`\`${output}\`\`\``, {
        type: 'text',
      });
    } catch (error) {
      const errorMessage = error.stack || error.message || String(error);
      await message.send(`*Error:*\n\`\`\`${errorMessage}\`\`\``);
    }
  }
);
