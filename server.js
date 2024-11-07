import fs from 'fs';
import path from 'path';
import { fork } from 'child_process';
import figlet from 'figlet';
import boxen from 'boxen';

const logDir = path.resolve(process.cwd(), 'logs');
const outLogPath = path.resolve(logDir, 'out.log');
const errLogPath = path.resolve(logDir, 'err.log');
const appPath = path.resolve(process.cwd(), 'index.js');
let appRunning = false;

if (!fs.existsSync(logDir)) {
	fs.mkdirSync(logDir, { recursive: true });
}

const logToFile = async (logPath, message) => {
	const timestamp = `[${new Date().toLocaleString()}]`;
	const logMessage = `${timestamp} ${message}\n`;
	try {
		await fs.promises.appendFile(logPath, logMessage);
	} catch (err) {
		console.error(`Error logging to file: ${err.message}`);
	}
};

const displayBanner = () => {
	figlet.text('XSTRO MD', { font: 'Big' }, (err, data) => {
		if (err) return;
		console.log(boxen(data, { padding: 1, margin: 1, borderColor: 'white', borderStyle: 'round' }));
		console.log('System initialized with high performance.\n');
	});
};

const startApp = () => {
	if (appRunning) return;
	appRunning = true;
	displayBanner();
	const child = fork(appPath, [], { stdio: ['pipe', 'pipe', 'pipe', 'ipc'] });

	child.stdout.on('data', async data => {
		const message = `${data.toString().trim()}`;
		await logToFile(outLogPath, message);
		console.log(`\x1b[34m${message}\x1b[0m`);
	});

	child.stderr.on('data', async data => {
		const message = `${data.toString().trim()}`;
		await logToFile(errLogPath, message);
		console.error(`\x1b[34m${message}\x1b[0m`);
	});

	child.on('exit', (code, signal) => {
		const exitMessage = `Application terminated with code ${code} and signal ${signal}`;
		logToFile(outLogPath, exitMessage);
		console.log(exitMessage);

		appRunning = false;
		if (code !== 0) {
			restartApplication();
		}
	});

	child.on('error', err => {
		const errorMessage = `Application error: ${err.message}`;
		logToFile(errLogPath, errorMessage);
		console.error(errorMessage);
	});

	return child;
};

const handleProcessTermination = signal => {
	console.log(`Terminating XSTRO MD due to signal: ${signal}`);
	console.log('Shutting down process...');
	process.exit();
};

const processEnd = () => {
	console.log('XSTRO MD has been manually ended.');
	console.log('Process has been manually terminated. Exiting...');
	process.exit();
};

const restartApplication = () => {
	if (!appRunning) {
		console.log('Preparing to restart the application...');
		setTimeout(() => {
			console.log('Restarting application now...');
			startApp();
		}, 2000);
	}
};

process.on('SIGINT', () => handleProcessTermination('SIGINT'));
process.on('SIGTERM', () => handleProcessTermination('SIGTERM'));

process.end = processEnd;

startApp();
