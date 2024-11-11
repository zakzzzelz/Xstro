import config from '../../config.js';
const { PREFIX } = config;
const commands = [];
const patternLengths = [];

function bot(cmdInfo, func) {
	cmdInfo.function = func;
	cmdInfo.pattern = new RegExp(`^(${PREFIX})\\s*(${cmdInfo.pattern})(?:\\s+(.*))?$`, 'i');
	cmdInfo.isPublic = cmdInfo.isPublic || false;
	cmdInfo.dontAddCommandList = cmdInfo.dontAddCommandList || false;
	cmdInfo.type = cmdInfo.type || 'misc';

	const patternLength = cmdInfo.pattern.source.length;
	cmdInfo.patternLength = patternLength;
	patternLengths.push(patternLength);
	commands.push(cmdInfo);
	return cmdInfo;
}

export { bot, patternLengths as commands };
