import { fork } from 'child_process';
import path from 'path';
import os from 'os';
import { EventEmitter } from 'events';
import fs from 'fs/promises';
import ora from 'ora';
import chalk from 'chalk';

class ProcessManager extends EventEmitter {
	constructor(config = {}) {
		super();
		this.config = {
			maxRestarts: 5,
			restartDelay: 5000,
			logPath: path.join(process.cwd(), 'logs'),
			appPath: path.join(process.cwd(), 'index.js'),
			crashTimeout: 10000,
			...config,
		};

		this.state = {
			isRunning: false,
			restartCount: 0,
			lastStartTime: 0,
			process: null,
			shuttingDown: false,
		};

		this.setupErrorHandlers();
		this.displayStartupInfo();
	}

	displayStartupInfo() {
		const timestamp = new Date().toISOString();
		console.log(chalk.blue(`[${timestamp}] [INFO] Starting Process Manager...`));
		console.log(chalk.blue(`[${timestamp}] [INFO] Platform: ${process.platform}`));
		console.log(chalk.blue(`[${timestamp}] [INFO] Architecture: ${process.arch}`));
		console.log(chalk.blue(`[${timestamp}] [INFO] Node Version: ${process.version}`));
		console.log(chalk.blue(`[${timestamp}] [INFO] Memory: ${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB`));
		console.log(chalk.blue(`[${timestamp}] [INFO] CPU: ${os.cpus()[0].model}`));
		console.log(chalk.blue(`[${timestamp}] [INFO] CPU Cores: ${os.cpus().length}`));
		console.log(chalk.blue(`[${timestamp}] [INFO] Working Directory: ${process.cwd()}`));
	}

	setupErrorHandlers() {
		process.on('uncaughtException', this.handleError.bind(this));
		process.on('unhandledRejection', this.handleError.bind(this));
		process.on('SIGTERM', this.shutdown.bind(this));
		process.on('SIGINT', this.shutdown.bind(this));
	}

	async start() {
		const spinner = ora('Starting the process...').start();
		try {
			await fs.mkdir(this.config.logPath, { recursive: true });
			this.startProcess();
			spinner.succeed('Process started successfully.');
		} catch (err) {
			spinner.fail('Failed to start process.');
			this.logError(err);
		}
	}

	startProcess() {
		if (this.state.isRunning || this.state.shuttingDown) return;

		const now = Date.now();
		if (now - this.state.lastStartTime > this.config.crashTimeout) {
			this.state.restartCount = 0;
		}

		this.state.lastStartTime = now;
		this.state.isRunning = true;

		const childProcess = fork(this.config.appPath, [], {
			stdio: 'pipe',
			env: { ...process.env, RESTART_COUNT: this.state.restartCount },
		});

		this.state.process = childProcess;

		childProcess.stdout.on('data', data => {
			this.logEvent(data.toString());
		});

		childProcess.stderr.on('data', data => {
			this.logError(data.toString());
		});

		childProcess.on('exit', code => {
			this.state.isRunning = false;
			if (!this.state.shuttingDown && code !== 0) this.handleCrash();
		});

		childProcess.on('error', error => {
			this.logError(error);
			this.handleCrash();
		});
	}

	logEvent(message) {
		const timestamp = new Date().toISOString();
		console.log(chalk.blue(`[${timestamp}] [EVENT] ${message}`));
	}

	handleCrash() {
		const timestamp = new Date().toISOString();
		this.state.restartCount++;
		if (this.state.restartCount > this.config.maxRestarts) {
			console.log(chalk.blue(`[${timestamp}] [ERROR] Process crashed ${this.state.restartCount} times. Stopping.`));
			this.state.restartCount = 0;
		} else {
			console.log(chalk.blue(`[${timestamp}] [WARNING] Process crashed. Restarting in ${this.config.restartDelay}ms...`));
			setTimeout(() => this.startProcess(), this.config.restartDelay);
		}
	}

	handleError(error) {
		const timestamp = new Date().toISOString();
		console.log(chalk.blue(`[${timestamp}] [ERROR] Error in process manager: ${error.message}`));
		this.handleCrash();
	}

	async shutdown() {
		if (this.state.shuttingDown) return;

		const timestamp = new Date().toISOString();
		this.state.shuttingDown = true;
		console.log(chalk.blue(`[${timestamp}] [INFO] Shutting down gracefully...`));

		if (this.state.process) {
			this.state.process.kill();
			await new Promise(resolve => setTimeout(resolve, 1000));
		}
		console.log(chalk.blue(`[${timestamp}] [INFO] Process will remain alive and will keep trying to restart if crashed.`));
	}

	logError(error) {
		const timestamp = new Date().toISOString();
		console.log(chalk.blue(`[${timestamp}] [ERROR] ${error.stack || error}`));
	}
}

const manager = new ProcessManager();
manager.start();
