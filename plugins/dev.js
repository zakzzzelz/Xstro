import { command } from "../lib/plugins.js";
import { inspect } from "util";

command({ on: "text" }, async (message, match, m, client) => {
	if (!match.startsWith("$ ")) return;
	const code = match.slice(2);
	const executeCode = async (code) => {
		const context = { message, match, m, client };
		const keys = Object.keys(context);
		const values = Object.values(context);
		const func = new Function(...keys, `return (async () => { ${code} })();`);
		return await func(...values);
	};
	try {
		let result = await executeCode(code);
		result = typeof result === "function" ? result.toString() : inspect(result, { depth: 1 });
		const formattedOutput = `*Result:*\n\`\`\`${result}\`\`\``;
		await message.send(formattedOutput);
	} catch (error) {
		const errorOutput = `_Error:_ ${error.message}`;
		await message.send(errorOutput);
	}
});
