import { ChatBot } from "../sql/lydia.js";
import { getJson } from "../utils.js";

export async function chatAi(msg, conn) {
    const chatSettings = await ChatBot.findOne();
    if (!chatSettings?.isActive) return;
    const isDM = msg.isGroup ? false : true;
    if ((chatSettings.isDMOnly && !isDM) || (chatSettings.isGCOnly && isDM)) return;
    await chatBotReply(msg, conn);
}

export async function chatBotReply(msg, conn) {
    if (!msg || !conn) return;
    if (!msg.body) return;
    try {
        const res = await getJson(
            `http://api.brainshop.ai/get?bid=159501&key=6pq8dPiYt7PdqHz3&uid=234&msg=${encodeURIComponent(msg.body)}`
        );
        await conn.sendMessage(msg.from, { text: res.cnt });
    } catch { }
}