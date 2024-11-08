import fs from 'fs';
import path from 'path';
import { fork } from 'child_process';
import figlet from 'figlet';
import boxen from 'boxen';
import os from 'os';

// Configuration
const config = {
	logDir: path.resolve(process.cwd(), 'logs'),
	outLogPath: path.resolve(process.cwd(), 'logs', 'out.log'),
	errLogPath: path.resolve(process.cwd(), 'logs', 'err.log'),
	metricsPath: path.resolve(process.cwd(), 'logs', 'metrics.log'),
	appPath: path.resolve(process.cwd(), 'index.js'),
	maxRestartAttempts: 5,
	restartDelay: 2000,
	rotateLogsSize: 10 * 1024 * 1024, // 10MB
	keepLogFiles: 5,
};

// State management
const state = {
	appRunning: false,
	restartAttempts: 0,
	startTime: null,
	lastRestart: null,
	currentChild: null,
	metrics: {
		restarts: 0,
		crashes: 0,
		totalUptime: 0,
	},
};

// Create necessary directories
if (!fs.existsSync(config.logDir)) {
	fs.mkdirSync(config.logDir, { recursive: true });
}

// Enhanced logging with log rotation
class Logger {
	constructor() {
		this.queue = Promise.resolve();
	}

	async checkRotation(logPath) {
		try {
			const stats = await fs.promises.stat(logPath);
			if (stats.size >= config.rotateLogsSize) {
				const ext = path.extname(logPath);
				const base = path.basename(logPath, ext);
				const dir = path.dirname(logPath);

				// Shift existing log files
				for (let i = config.keepLogFiles - 1; i >= 0; i--) {
					const oldPath = path.join(dir, `${base}.${i}${ext}`);
					const newPath = path.join(dir, `${base}.${i + 1}${ext}`);
					if (fs.existsSync(oldPath)) {
						await fs.promises.rename(oldPath, newPath);
					}
				}

				// Rename current log file
				await fs.promises.rename(logPath, path.join(dir, `${base}.0${ext}`));
			}
		} catch (err) {
			console.error(`Log rotation error: ${err.message}`);
		}
	}

	async log(logPath, message, type = 'info') {
		const timestamp = new Date().toISOString();
		const formattedMessage = `[${timestamp}][${type.toUpperCase()}] ${message}\n`;

		this.queue = this.queue
			.then(async () => {
				await this.checkRotation(logPath);
				await fs.promises.appendFile(logPath, formattedMessage);
			})
			.catch(err => {
				console.error(`Logging error: ${err.message}`);
			});

		return this.queue;
	}
}

const logger = new Logger();

// System metrics collection
const collectMetrics = () => {
	const metrics = {
		timestamp: new Date().toISOString(),
		memory: process.memoryUsage(),
		cpu: process.cpuUsage(),
		uptime: process.uptime(),
		systemLoad: os.loadavg(),
		freeMemory: os.freemem(),
		totalMemory: os.totalmem(),
	};

	logger.log(config.metricsPath, JSON.stringify(metrics), 'metrics');
};

// Enhanced banner display
const displayBanner = () => {
	return new Promise(resolve => {
		figlet.text(
			'XSTRO MD',
			{
				font: 'Big',
				horizontalLayout: 'default',
				verticalLayout: 'default',
			},
			(err, data) => {
				if (err) {
					console.error('Banner generation failed:', err);
					resolve();
					return;
				}

				const banner = boxen(data, {
					padding: 1,
					margin: 1,
					borderColor: 'white',
					borderStyle: 'round',
					title: 'Process Manager',
					titleAlignment: 'center',
				});

				console.log(banner);
				console.log('\nSystem Information:');
				console.log(`OS: ${os.type()} ${os.release()}`);
				console.log(`Memory: ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`);
				console.log(`CPUs: ${os.cpus().length}`);
				console.log('\nSystem initialized with high performance.\n');
				resolve();
			},
		);
	});
};

// Enhanced application start
const startApp = async () => {
	if (state.appRunning) return null;

	try {
		await displayBanner();

		state.appRunning = true;
		state.startTime = Date.now();
		state.currentChild = fork(config.appPath, [], {
			stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
			env: { ...process.env, RESTART_COUNT: state.restartAttempts },
		});

		// Stream handling with error recovery
		const handleStream = async (stream, logPath, type) => {
			stream.on('data', async data => {
				const message = data.toString().trim();
				await logger.log(logPath, message, type);
				console.log(`\x1b[34m${message}\x1b[0m`);
			});
		};

		handleStream(state.currentChild.stdout, config.outLogPath, 'stdout');
		handleStream(state.currentChild.stderr, config.errLogPath, 'error');

		// Enhanced event handling
		state.currentChild.on('message', async message => {
			await logger.log(config.outLogPath, `IPC Message: ${JSON.stringify(message)}`, 'ipc');
		});

		state.currentChild.on('exit', handleExit);
		state.currentChild.on('error', handleError);

		// Start metrics collection
		const metricsInterval = setInterval(collectMetrics, 60000);
		state.currentChild.on('exit', () => clearInterval(metricsInterval));

		return state.currentChild;
	} catch (err) {
		await logger.log(config.errLogPath, `Failed to start application: ${err.message}`, 'error');
		throw err;
	}
};

// Enhanced exit handling
const handleExit = async (code, signal) => {
	const uptime = (Date.now() - state.startTime) / 1000;
	state.metrics.totalUptime += uptime;

	const exitMessage = {
		type: 'exit',
		code,
		signal,
		uptime,
		restartAttempts: state.restartAttempts,
		timestamp: new Date().toISOString(),
	};

	await logger.log(config.outLogPath, JSON.stringify(exitMessage), 'exit');

	state.appRunning = false;
	state.metrics.crashes += code !== 0 ? 1 : 0;

	if (code !== 0 && state.restartAttempts < config.maxRestartAttempts) {
		await restartApplication();
	} else if (state.restartAttempts >= config.maxRestartAttempts) {
		await logger.log(config.errLogPath, 'Maximum restart attempts reached. Shutting down.', 'error');
		process.exit(1);
	}
};

// Enhanced error handling
const handleError = async err => {
	const errorMessage = {
		type: 'error',
		message: err.message,
		stack: err.stack,
		timestamp: new Date().toISOString(),
	};

	await logger.log(config.errLogPath, JSON.stringify(errorMessage), 'error');
};

// Enhanced process termination handling
const handleProcessTermination = async signal => {
	const terminationMessage = `Terminating XSTRO MD due to signal: ${signal}`;
	await logger.log(config.outLogPath, terminationMessage, 'termination');

	if (state.currentChild) {
		state.currentChild.kill(signal);
	}

	// Save final metrics
	await logger.log(config.metricsPath, JSON.stringify(state.metrics), 'final');

	console.log('\nShutting down process...');
	process.exit(0);
};

// Enhanced restart functionality
const restartApplication = async () => {
	if (!state.appRunning) {
		state.restartAttempts++;
		state.metrics.restarts++;
		state.lastRestart = Date.now();

		const restartMessage = `Preparing restart attempt ${state.restartAttempts} of ${config.maxRestartAttempts}`;
		await logger.log(config.outLogPath, restartMessage, 'restart');
		console.log(restartMessage);

		setTimeout(async () => {
			console.log('Restarting application now...');
			await startApp();
		}, config.restartDelay);
	}
};

// Process event handlers
process.on('SIGINT', () => handleProcessTermination('SIGINT'));
process.on('SIGTERM', () => handleProcessTermination('SIGTERM'));
process.on('uncaughtException', async err => {
	await logger.log(config.errLogPath, `Uncaught Exception: ${err.stack}`, 'critical');
	handleProcessTermination('UNCAUGHT_EXCEPTION');
});
process.on('unhandledRejection', async reason => {
	await logger.log(config.errLogPath, `Unhandled Rejection: ${reason}`, 'critical');
	handleProcessTermination('UNHANDLED_REJECTION');
});

// Start the application
startApp().catch(console.error);
