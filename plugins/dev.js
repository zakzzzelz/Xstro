import { command } from "../lib/plugins.js";
import { inspect } from "util";

command({ on: "text", dontAddCommandList: true }, async (message, match, m, client) => {
	if (!match.startsWith("$ ")) return;
	const code = match.slice(2).trim();
	const executeCode = async (code) => {
		const context = { message, match, m, client, ...process.env };
		const keys = Object.keys(context);
		const values = Object.values(context);
		const func = `async () => { return (${code}); }`;
		return await eval(func).apply(null, values);
	};

	try {
		let result = await executeCode(code);
		result = typeof result === "function" ? result.toString() : inspect(result, { depth: 1 });
		const formattedOutput = `*Result:*\n\`\`\`${result}\`\`\``;
		await message.sendReply(formattedOutput);
	} catch (error) {
		const errorOutput = `_Error:_ ${error.message}`;
		await message.sendReply(errorOutput);
	}
});
