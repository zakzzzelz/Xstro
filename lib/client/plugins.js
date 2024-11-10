import { PREFIX } from '../../config.js';
const commands = [];

function bot(cmdInfo, func) {
	cmdInfo.function = func;
	cmdInfo.pattern = new RegExp(`^(${PREFIX})\\s*(${cmdInfo.pattern})(?:\\s+(.*))?$`, 'i');
	cmdInfo.isPublic = cmdInfo.isPublic || false;
	cmdInfo.dontAddCommandList = cmdInfo.dontAddCommandList || false;
	cmdInfo.type = cmdInfo.type || 'misc';

	commands.push(cmdInfo);
	return cmdInfo;
}

export { bot, commands };
