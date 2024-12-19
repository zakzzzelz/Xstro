import { bot } from '#lib';
import { numtoId } from '#lib';

bot(
	{
		pattern: 'report',
		isPublic: true,
		desc: 'Request Feature or Report Bugs',
	},
	async (message, match) => {
		if (!match || match.split(' ').length < 5) return message.send('```You must provide a reason for reporting a bug, and your message must be at least 5 words.```');
		const bugMessage = match;
		const devs = ['2348039607375', '923192173398', '2347041620617', '923089660496'];
		const errorReport = `\`\`\`
BUG REPORT
FROM: @${message.sender.split('@')[0]}
MESSAGE: \n${bugMessage}
\`\`\``;
		for (const dev of devs) {
			await message.send(errorReport, { jid: numtoId(dev), mentions: [message.sender] });
		}
	},
);
