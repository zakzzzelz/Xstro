import { bot } from "../lib/plugins.js";
import { manageVar } from "../lib/env.js";
import fs from "fs";
import path from "path";

const envFilePath = path.join(process.cwd(), ".env");

const ensureEnvFileExists = () => {
	if (!fs.existsSync(envFilePath)) fs.writeFileSync(envFilePath, "", "utf-8");
};
ensureEnvFileExists();

bot(
	{
		pattern: "setvar",
		desc: "Set system var",
		type: "system",
	},
	async (message, match) => {
		if (!match) return message.sendReply("_Use: .setvar KEY:VALUE_");
		const input = match.split(":");
		if (input.length !== 2) return message.sendReply("_Use: .setvar KEY:VALUE_");
		const [key, value] = input.map((item) => item.trim());
		await manageVar({ command: "set", key, value });
		return message.sendReply(`*✓ Variable set: ${key}=${value}*`);
	},
);

bot(
	{
		pattern: "delvar",
		desc: "Delete system var",
		type: "system",
	},
	async (message, match) => {
		if (!match) return message.sendReply("_Provide variable name to delete_");
		const key = match.trim();
		await manageVar({ command: "del", key });
		return message.sendReply(`*✓ Deleted ${key} from env*`);
	},
);

bot(
	{
		pattern: "getvar",
		desc: "Get system vars",
		type: "system",
	},
	async (message) => {
		const vars = await manageVar({ command: "get" });
		return message.sendReply(vars || "_No Vars Found_");
	},
);
