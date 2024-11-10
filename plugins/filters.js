import { bot } from '../lib/client/plugins.js';
import { addFilter, getDMFilters, getGCFilters, getSpecificFilter, deleteFilters } from '../lib/sql/filters.js';
import { fancy } from '../lib/extras/font.js';

bot(
	{
		pattern: 'filters',
		isPublic: false,
		desc: 'Get Filter Settings & Info',
		type: 'filter',
	},
	async (message, match) => {
		let text = `*Filter Configurations*\n\n`;
		text += `1. *Filter Configuration*\n`;
		text += `   ├ .filter gc <trigger>|<response> : Add group filter\n`;
		text += `   └ .filter dm <trigger>|<response> : Add DM filter\n\n`;
		text += `2. *Filter Management*\n`;
		text += `   ├ .fstop gc : Disable group filters\n`;
		text += `   └ .fstop dm : Disable DM filters\n\n`;
		text += `3. *Filter Lists*\n`;
		text += `   ├ .getfilter <trigger> : Get specific filter\n`;
		text += `   ├ .dmfilters : List all DM filters\n`;
		text += `   └ .gcfilters : List all group filters\n`;
		return await message.sendReply(fancy(text));
	},
);

bot(
	{
		pattern: 'filter',
		isPublic: false,
		desc: 'Add new filter',
		type: 'filter',
	},
	async (message, match) => {
		if (!match) return await message.sendReply('_Provide filter type, trigger and response_\n\n_Example: .filter gc hello|Hi there! or .filter dm hi|Hello!_');

		const type = match.split(' ')[0];
		if (!['gc', 'dm'].includes(type)) return await message.sendReply('_Invalid filter type. Use gc or dm_');

		const filterContent = match.split(' ').slice(1).join(' ');
		const [trigger, response] = filterContent.split('|').map(item => item.trim());

		if (!trigger || !response) return await message.sendReply('_Provide both trigger and response separated by |_');

		const isGroup = message.jid.includes('@g.us');
		if (type === 'gc' && !isGroup) return await message.sendReply('_GC filters can only be set in groups_');
		if (type === 'dm' && isGroup) return await message.sendReply('_DM filters can only be set in DMs_');

		const jid = isGroup ? message.jid : message.sender;
		await addFilter(jid, trigger, response, type);
		return await message.sendReply(`✅ ${type.toUpperCase()} Filter *${trigger}* added successfully`);
	},
);

bot(
	{
		pattern: 'fstop',
		isPublic: false,
		desc: 'Delete filter',
		type: 'filter',
	},
	async (message, match) => {
		if (!match) return await message.sendReply('_Specify filter type to disable (gc/dm)_');
		if (!['gc', 'dm'].includes(match)) return await message.sendReply('_Invalid filter type. Use gc or dm_');

		const isGroup = message.jid.includes('@g.us');
		if (match === 'gc' && !isGroup) return await message.sendReply('_Can only disable GC filters in groups_');
		if (match === 'dm' && isGroup) return await message.sendReply('_Can only disable DM filters in DMs_');

		const jid = isGroup ? message.jid : message.sender;
		const deleted = await deleteFilters(match, jid);

		if (deleted.count === 0) return await message.sendReply(`_No ${match.toUpperCase()} filters found to disable_`);
		return await message.sendReply(`_All ${match.toUpperCase()} filters disabled_`);
	},
);

bot(
	{
		pattern: 'getfilter',
		isPublic: false,
		desc: 'Get specific filter',
		type: 'filter',
	},
	async (message, match) => {
		if (!match) return await message.sendReply('❌ Please provide filter trigger');
		const filter = await getSpecificFilter(message.jid, match);
		if (!filter.data) return await message.sendReply(`_Filter *${match}* not found_`);
		return await message.sendReply(`*Filter Details*\nTrigger: ${filter.data.filterMessage}\nResponse: ${filter.data.response}`);
	},
);

bot(
	{
		pattern: 'dmfilters',
		isPublic: false,
		desc: 'Get DM filters',
		type: 'filter',
	},
	async (message, match) => {
		const filters = await getDMFilters();
		if (!filters.data.length) return await message.sendReply('_No DM filters found_');
		let text = '*DM Filter List*\n\n';
		filters.data.forEach((filter, i) => {
			text += `${i + 1}. Trigger: ${filter.filterMessage}\n   Response: ${filter.response}\n\n`;
		});
		return await message.sendReply(text);
	},
);

bot(
	{
		pattern: 'gcfilters',
		isPublic: false,
		desc: 'Get group chat filters',
		type: 'filter',
	},
	async (message, match) => {
		const filters = await getGCFilters();
		if (!filters.data.length) return await message.sendReply('_No group chat filters found_');
		let text = '*Group Chat Filter List*\n\n';
		filters.data.forEach((filter, i) => {
			text += `${i + 1}. Trigger: ${filter.filterMessage}\n   Response: ${filter.response}\n\n`;
		});
		return await message.sendReply(text);
	},
);
