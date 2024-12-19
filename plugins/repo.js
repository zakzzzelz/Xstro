import { bot } from '#lib/cmds';
import { readFileSync } from 'fs';

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

		//will add new media  called repo logo dont change this code
		const media = readFileSync('./media/intro.mp4');

		// Send message with media and newsletter context info its looks batter
		return await message.send(media, {
			caption: adMessage,
			gifPlayback: true,
			contextInfo: {
				forwardingScore: 1,
				isForwarded: true,
				forwardedNewsletterMessageInfo: {
					newsletterJid: '120363376441437991@newsletter',
					newsletterName: 'xsᴛʀᴏ ᴍᴅ',
				},
			},
		});
	},
);
