import { fork } from 'child_process';
import { resolve } from 'path';

let app = null;
let shouldRestart = true;

const start = () => {
	app = fork(resolve('server.js'), [], {
		stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
		env: process.env
	});

	app.on('message', msg => {
		if (msg === 'app.kill') {
			shouldRestart = false;
			app.kill('SIGTERM');
		}
	});

	app.on('exit', () => {
		if (shouldRestart) {
			start();
		} else {
			process.exit(0);
		}
	});
};

process.on('SIGINT', () => {
	if (app) {
		shouldRestart = false;
		app.kill('SIGTERM');
	}
	process.exit(0);
});

process.on('SIGTERM', () => {
	if (app) {
		shouldRestart = false;
		app.kill('SIGTERM');
	}
	process.exit(0);
});

start();
