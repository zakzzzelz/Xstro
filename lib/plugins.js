import { PREFIX } from "../config.js";
const commands = [];

function bot(cmdInfo, func) {
	cmdInfo.function = func;
	cmdInfo.pattern = new RegExp(`(${PREFIX})( ?${cmdInfo.pattern}(?=\\b|$))(.*)`, "i") || false;
	cmdInfo.alias = cmdInfo.alias;
	cmdInfo.dontAddCommandList = cmdInfo.dontAddCommandList || false;
	cmdInfo.fromMe = cmdInfo.fromMe || false;
	cmdInfo.type = cmdInfo.type || "misc";

	commands.push(cmdInfo);
	return cmdInfo;
}

export { bot, commands };
