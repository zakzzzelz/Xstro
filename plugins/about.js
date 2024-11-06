import { bot } from '../lib/client/plugins.js';
bot(
	{
		pattern: 'about',
		desc: 'About Bot',
		type: 'user',
	},
	async message => {
		const buttons = [{ type: 'url', params: { display_text: 'Visit Site', url: 'https://github.com/ASTRO-X10/xstro-md' } }];
		const content = {
			button: buttons,
		};
		return await message.send(content, { type: 'button' });
	},
);
