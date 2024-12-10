import { bot } from '../lib/plugins.js';
import { fancy } from './bot/font.js';
import { addDmFilter, addGcFilter, getDmFilters, getGcFilters, removeDmFilter, removeGcFilter } from '../sql/filters.js';

bot(
	{
		pattern: 'filters',
		isPublic: false,
		desc: 'Displays Available Filter Commands and how to use them',
	},
	async message => {
		const Msg = `
Filters Setup For Xstro

${message.prefix}pfilter hi;hello (To setup filter for direct messages)

${message.prefix}gfilter hello;Hi how are you (To setup filter for group messages)

${message.prefix}delfilter gc hi (To delete a filter set for groups)

${message.prefix}delfilter dm hi (To delete a filter set for direct messages)
    `;
		return await message.send(fancy(Msg));
	},
);

bot(
	{
		pattern: 'pfilter',
		isPublic: false,
		desc: 'Set up DM filters',
	},
	async (message, match) => {
		if (!match.includes(';')) return await message.send('Use the format: pfilter <text>;<response>');

		const [text, response] = match.split(';');
		if (!text || !response) return await message.send('Both text and response are required.');

		const result = await addDmFilter(text.trim(), response.trim());
		return await message.send(result);
	},
);

bot(
	{
		pattern: 'gfilter',
		isPublic: false,
		desc: 'Set up group chat filters',
	},
	async (message, match) => {
		if (!match.includes(';')) return await message.send('Use the format: gfilter <text>;<response>');

		const [text, response] = match.split(';');
		if (!text || !response) return await message.send('Both text and response are required.');

		const result = await addGcFilter(text.trim(), response.trim());
		return await message.send(result);
	},
);

bot(
	{
		pattern: 'delfilter',
		isPublic: false,
		desc: 'Delete filters (DM or group)',
	},
	async (message, match) => {
		if (!match.startsWith('gc ') && !match.startsWith('dm ')) {
			return await message.send('Use the format: delfilter <gc/dm> <text>');
		}

		const [type, ...textParts] = match.split(' ');
		const text = textParts.join(' ').trim();
		if (!text) return await message.send('Filter text is required.');

		let result;
		if (type === 'gc') {
			result = await removeGcFilter(text);
		} else if (type === 'dm') {
			result = await removeDmFilter(text);
		} else {
			return await message.send('Invalid type. Use "gc" for group or "dm" for direct messages.');
		}

		return await message.send(result);
	},
);

bot(
	{
		pattern: 'getfilters',
		isPublic: false,
		desc: 'List all filters',
	},
	async message => {
		const dmFilters = await getDmFilters();
		const gcFilters = await getGcFilters();

		let response = 'Available Filters:\n\nDirect Message Filters:\n';
		response += dmFilters.length ? dmFilters.map(filter => `• ${filter.word}: ${filter.response}`).join('\n') : 'None';

		response += '\n\nGroup Chat Filters:\n';
		response += gcFilters.length ? gcFilters.map(filter => `• ${filter.word}: ${filter.response}`).join('\n') : 'None';

		return await message.send(response);
	},
);

bot(
	{
		on: 'chats_updates',
		dontAddCommandList: true,
	},
	async message => {
		const sender = message.sender;
		if (sender === message.user) return; // Don't reply to yourself

		const chatType = message.isGroup ? 'gc' : 'dm';
		const filters = chatType === 'gc' ? await getGcFilters() : await getDmFilters();
		const content = message.text?.trim();

		if (!content || !filters.length) return;

		const matchedFilter = filters.find(filter => filter.word === content);
		if (matchedFilter) {
			await message.send(matchedFilter.response);
		}
	},
);
