import Filters from '../sql/filters.js';

export async function handleFilters(conn, msg) {
	if (!msg.body) return;

	const isGroup = msg.jid.includes('@g.us');
	const type = isGroup ? 'gc' : 'dm';

	const filters = await Filters.findAll({
		where: {
			jid: isGroup ? msg.jid : msg.sender,
			type,
		},
	});

	if (!filters.length) return;

	for (const filter of filters) {
		if (msg.body.toLowerCase().includes(filter.filterMessage.toLowerCase())) {
			await conn.sendMessage(
				msg.from,
				{
					text: filter.response,
				},
				{
					quoted: msg,
				},
			);
			break;
		}
	}
}
