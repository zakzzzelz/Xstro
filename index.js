import { fork } from 'child_process';

const SCRIPT_PATH = './client/app.js';

let app;

const startApp = () => {
	console.log('Starting application...');
	app = fork(SCRIPT_PATH);

	app.on('message', message => {
		if (message === 'app.kill') {
			console.log('Received app.kill signal. Shutting down...');
			app.kill();
			process.exit(0);
		}
	});

	app.on('exit', code => {
		if (code === 0) {
			console.log('Application exited normally. Restarting...');
			startApp();
		} else {
			console.log(
				`Application crashed with code ${code}. Restarting...`,
			);
			startApp();
		}
	});

	app.on('error', error => {
		console.error('Error occurred in the child process:', error);
		startApp();
	});
};

const handleUnhandledRejections = () => {
	process.on('unhandledRejection', (reason, promise) => {
		console.error('Unhandled Rejection at:', promise, 'reason:', reason);
		startApp();
	});
};

startApp();
handleUnhandledRejections();

process.on('SIGINT', () => {
	console.log('Received SIGINT. Terminating...');
	if (app) app.kill();
	process.exit(0);
});
