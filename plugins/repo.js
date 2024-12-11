import { bot } from '../lib/cmds.js';

bot(
	{
		pattern: 'repo',
		isPublic: true,
		desc: 'Sends bot info, social links, and GitHub repo details.',
	},
	async message => {
		const adMessage = `\`\`\`
Xstro Multi Device WhatsApp Bot

GitHub: [Explore & Contribute](https://github.com/AstroX11/Xstro)

Maintainers
- Astro (Main Dev)
- Mr. Wasi (Contributor Dev)
- Paradoxical (Beta Testers)
- Emperor (Beta Testers)

*Help Us Improve:* Star, report bugs, or suggest features!

© 2024 Xstro 
    \`\`\``;
		await message.send(adMessage);
	},
);
