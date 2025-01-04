import { fork } from 'child_process';
import { resolve } from 'path';

const log = msg => console.log('\x1b[34m%s\x1b[0m', msg);
let app = null;
let isShuttingDown = false;

const shutdown = async () => {
	if (isShuttingDown || !app) return;
	isShuttingDown = true;

	app.kill('SIGTERM');
	await new Promise(r => setTimeout(r, 5000));

	if (!app.killed) {
		log('Force terminating process');
		app.kill('SIGKILL');
	}
	process.exit(0);
};

const start = () => {
	if (isShuttingDown) return;

	app = fork(resolve('server.js'));

	app.on('message', msg => msg === 'app.kill' && shutdown());

	app.on('exit', code => {
		if (isShuttingDown) return;
		log(`Process exited (${code}), restarting in 15s`);
		setTimeout(start, 15000);
	});

	app.on('error', err => {
		log(`Error: ${err.message}`);
		if (!isShuttingDown) setTimeout(start, 15000);
	});
};

process.setMaxListeners(2000);
['SIGINT', 'SIGTERM'].forEach(signal => process.on(signal, shutdown));
process.on('unhandledRejection', reason => log(`Unhandled rejection: ${reason}`));

start();
