import { fork } from 'child_process';
import path from 'path';
import os from 'os';
import { EventEmitter } from 'events';
import fs from 'fs/promises';
import ora from 'ora';

class ProcessManager extends EventEmitter {
	constructor(config = {}) {
		super();
		this.displayStartupInfo();
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
	}

	displayStartupInfo() {
		console.log(`
██████╗ ██████╗  ██████╗  ██████╗███████╗███████╗███████╗
██╔══██╗██╔══██╗██╔═══██╗██╔════╝██╔════╝██╔════╝██╔════╝
██████╔╝██████╔╝██║   ██║██║     █████╗  ███████╗███████╗
██╔═══╝ ██╔══██╗██║   ██║██║     ██╔══╝  ╚════██║╚════██║
██║     ██║  ██║╚██████╔╝╚██████╗███████╗███████║███████║
╚═╝     ╚═╝  ╚═╝ ╚═════╝  ╚═════╝╚══════╝╚══════╝╚══════╝
███╗   ███╗ █████╗ ███╗   ██╗ █████╗  ██████╗ ███████╗██████╗ 
████╗ ████║██╔══██╗████╗  ██║██╔══██╗██╔════╝ ██╔════╝██╔══██╗
██╔████╔██║███████║██╔██╗ ██║███████║██║  ███╗█████╗  ██████╔╝
██║╚██╔╝██║██╔══██║██║╚██╗██║██╔══██║██║   ██║██╔══╝  ██╔══██╗
██║ ╚═╝ ██║██║  ██║██║ ╚████║██║  ██║╚██████╔╝███████╗██║  ██║
╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝
`);

		console.log('\n=== ENVIRONMENT INFO ===');
		console.log(`Platform: ${process.platform}`);
		console.log(`Architecture: ${process.arch}`);
		console.log(`Node Version: ${process.version}`);
		console.log(`Memory: ${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB`);
		console.log(`CPU: ${os.cpus()[0].model}`);
		console.log(`CPU Cores: ${os.cpus().length}`);
		console.log(`Working Directory: ${process.cwd()}`);
		console.log('=====================\n');
	}

	setupErrorHandlers() {
		process.on('uncaughtException', this.handleError.bind(this));
		process.on('unhandledRejection', this.handleError.bind(this));
		process.on('SIGTERM', this.shutdown.bind(this));
		process.on('SIGINT', this.shutdown.bind(this));
	}

	async start() {
		await fs.mkdir(this.config.logPath, { recursive: true }).catch(() => {});
		const spinner = ora('Starting the process...').start();

		try {
			this.startProcess();
			spinner.succeed('Process started successfully.');
		} catch (err) {
			spinner.fail('Failed to start process.');
			console.error(err);
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
			stdio: 'inherit',
			env: { ...process.env, RESTART_COUNT: this.state.restartCount },
		});

		this.state.process = childProcess;

		childProcess.on('exit', (code, signal) => {
			this.state.isRunning = false;
			if (!this.state.shuttingDown && code !== 0) {
				this.handleCrash();
			}
		});

		childProcess.on('error', error => {
			console.error('Process error:', error);
			this.handleCrash();
		});
	}

	handleCrash() {
		this.state.restartCount++;

		if (this.state.restartCount > this.config.maxRestarts) {
			console.error(`Process crashed ${this.state.restartCount} times. Stopping.`);
			this.shutdown();
			return;
		}

		console.log(`Process crashed. Restarting in ${this.config.restartDelay}ms...`);
		setTimeout(() => this.startProcess(), this.config.restartDelay);
	}

	handleError(error) {
		console.error('Error in process manager:', error);
		this.handleCrash();
	}

	shutdown() {
		if (this.state.shuttingDown) return;

		this.state.shuttingDown = true;
		console.log('Shutting down gracefully...');

		if (this.state.process) {
			this.state.process.kill();
		}

		setTimeout(() => {
			process.exit(0);
		}, 1000);
	}
}

const manager = new ProcessManager();
manager.start();
