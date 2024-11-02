import { BOT_INFO } from "../config.js";
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
		return message.send(BOT_INFO.split(";")[2], { caption: msg, mentions: [message.participant] });
	},
);
