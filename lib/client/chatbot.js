import { chatAi } from '../../plugins/client/ai.js';
import { ChatBot } from '../sql/lydia.js';

export async function chatbot(conn, msg) {
	try {
		const settings = await ChatBot.findOne({
			where: {
				enabled: true,
			},
		});

		if (!settings) return;
		if (settings.type === 'all') {
		} else if (settings.type === 'gc' && msg.isGroup) {
		} else if (settings.type === 'dm' && !msg.isGroup && msg.from === settings.chat) {
		} else {
			return;
		}

		const response = await chatAi(msg.sender, msg.body);
		await conn.sendMessage(
			msg.from,
			{
				text: response,
			},
			{
				quoted: msg,
			},
		);
	} catch {}
}
