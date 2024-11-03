import { bot } from "../lib/plugins.js";
import { inspect } from "util";

bot({ on: "text", dontAddCommandList: true }, async (message, match, m, client) => {
	if (!match.startsWith("$ ")) return;
	const code = match.slice(2).trim();
	const executeCode = async code => {
		let processedCode = code.replace(/\$\s*(\w+)\s*/g, '$1');
		const wrapped = `async()=>{try{${processedCode.includes('return') ? processedCode : `return ${processedCode}`}}catch(e){return e}}`;
		return await eval(wrapped)();
	};
	try {
		let result = await executeCode(code);
		if (result instanceof Error) throw result;
		result = typeof result === "function" ? result.toString() : inspect(result, { depth: null });
		await message.sendReply(`*Result:*\n\`\`\`${result}\`\`\``);
	} catch (e) {
		await message.sendReply(`_Error:_ ${e.message || e}`);
	}
});