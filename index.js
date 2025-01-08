import { fork } from 'child_process';
import { resolve } from 'path';

let app = null;

const start = () => {
	app = fork(resolve('server.js'), [], {
		stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
		env: process.env
	});

	app.on('message', msg => {
		if (msg === 'app.kill') app.kill('SIGTERM');
	});
	app.on('exit', () => start());
};

process.on('SIGINT', () => app && app.kill('SIGTERM'));
process.on('SIGTERM', () => app && app.kill('SIGTERM'));

start();
