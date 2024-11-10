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
		text += `   ├ .filter gc <text> : Add group filter\n`;
		text += `   └ .filter dm <text> : Add DM filter\n\n`;
		text += `2. *Filter Management*\n`;
		text += `   ├ .fstop gc : Disable group filters\n`;
		text += `   └ .fstop dm : Disable DM filters\n\n`;
		text += `3. *Filter Lists*\n`;
		text += `   ├ .getfilters : Get specific filters\n`;
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
		if (!match) return await message.sendReply('_Provide filter type and message_\n\n_Example: .filter gc hello | .filter dm hi_');
		const type = match.split(' ')[0];
		const filterText = match.split(' ').slice(1).join(' ');
		if (!filterText) return await message.sendReply('_Provide filter message_');
		if (!['gc', 'dm'].includes(type)) return await message.sendReply('_Invalid filter type. Use gc or dm_');
		const isGroup = message.jid.includes('@g.us');
		if (type === 'gc' && !isGroup) return await message.sendReply('_GC filters can only be set in groups_');
		if (type === 'dm' && isGroup) return await message.sendReply('_DM filters can only be set in DMs_');
		await addFilter(filterText);
		return await message.sendReply(`✅ ${type.toUpperCase()} Filter *${filterText}* added successfully`);
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
		const deleted = await deleteFilters(match);
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
		if (!match) return await message.sendReply('❌ Please provide filter message');
		const filter = await getSpecificFilter(message.jid, match);
		if (!filter.data) return await message.sendReply(`_Filter *${match}* not found_`);
		return await message.sendReply(`_Filter found: *${filter.data.filterMessage}*_`);
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
			text += `${i + 1}. ${filter.filterMessage}\n`;
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
			text += `${i + 1}. ${filter.filterMessage}\n`;
		});
		return await message.sendReply(text);
	},
);
