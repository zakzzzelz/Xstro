import Filters from '../sql/filters.js';

export async function handleFilters(conn, msg) {
	if (!msg.body) return;
	const filters = await Filters.findAll({
		where: {
			jid: msg.isGroup ? '@g.us' : '@s.whatsapp.net',
		},
	});
	if (!filters.length) return;
	for (const filter of filters) {
		if (msg.body.toLowerCase().includes(filter.filterMessage.toLowerCase())) {
			await conn.sendMessage(msg.from, { text: filter.filterMessage }, { quoted: msg });
			break;
		}
	}
}
