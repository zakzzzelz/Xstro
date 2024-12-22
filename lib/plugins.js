/**
 * Configures and registers a bot command with specified parameters
 * */
function bot(cmd, excution, prefix = DEFAULT_PREFIX) {
	const safePrefix = prefix
		.split('')
		.map(char => `\\${char}`)
		.join('|');

	cmd.function = excution;
	cmd.pattern = new RegExp(
		`^(${safePrefix})\\s*(${cmd.pattern})(?:\\s+(.*))?$`,
		'i',
	);
	cmd.public = cmd.public || false;
	cmd.isGroup = cmd.isGroup || false;
	cmd.dontAddCommandList = cmd.dontAddCommandList || false;

	commands.push(cmd);
	return cmd;
}
