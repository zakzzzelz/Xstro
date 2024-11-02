import { aliveMessage, setAliveMsg } from "../lib/alive.js";
import { bot } from "../lib/plugins.js";

bot(
	{
		pattern: "alive",
		desc: "Is Bot Alive?",
		type: "user",
	},
	async (message, match) => {
		if (match) {
			await setAliveMsg(match);
			return message.sendReply("_Alive Updated_");
		}
		const msg = await aliveMessage(message);
		return message.sendReply(msg, { mentions: [message.participant] });
	},
);
