import { fork } from 'child_process';
import { resolve } from 'path';

process.setMaxListeners(2000);

const CONFIG = {
	scriptPath: resolve('server.js'),
	maxRestarts: 10,
	restartDelay: 1000,
	gracefulTimeout: 5000,
};

class ProcessManager {
	constructor() {
		this.app = null;
		this.restartCount = 0;
		this.shutdownInProgress = false;
		this.logger = this.setupLogger();
	}

	setupLogger() {
		const blue = '\x1b[34m%s\x1b[0m';
		return {
			info: msg => console.log(blue, msg),
			error: msg => console.log(blue, `Error: ${msg}`),
			warn: msg => console.log(blue, `Warning: ${msg}`),
		};
	}

	start() {
		if (this.shutdownInProgress) return;

		this.logger.info('Initializing process');

		this.app = fork(CONFIG.scriptPath, {
			env: { ...process.env, RESTART_COUNT: this.restartCount },
		});

		this.attachEventHandlers();
	}

	attachEventHandlers() {
		this.app.on('message', this.handleMessage.bind(this));
		this.app.on('exit', this.handleExit.bind(this));
		this.app.on('error', this.handleError.bind(this));

		process.on('SIGINT', this.handleSigInt.bind(this));
		process.on('SIGTERM', this.handleSigInt.bind(this));
		process.on('unhandledRejection', this.handleUnhandledRejection.bind(this));
	}

	handleMessage(message) {
		if (message === 'app.kill') {
			this.logger.info('Termination signal received');
			this.shutdown();
		}
	}

	handleExit(code) {
		if (this.shutdownInProgress) return;

		this.restartCount++;
		const message = code === 0 ? 'Process terminated normally' : `Process failed: code ${code}`;

		if (this.restartCount > CONFIG.maxRestarts) {
			this.logger.error(`Restart limit exceeded: ${CONFIG.maxRestarts}`);
			this.shutdown();
			return;
		}

		this.logger.warn(`${message} | Attempt ${this.restartCount}/${CONFIG.maxRestarts}`);
		setTimeout(() => this.start(), CONFIG.restartDelay);
	}

	handleError(error) {
		this.logger.error(`Process error: ${error.message}`);
		if (!this.shutdownInProgress) this.start();
	}

	handleSigInt() {
		this.logger.info('Interrupt signal detected');
		this.shutdown();
	}

	handleUnhandledRejection(reason, promise) {
		this.logger.error(`Unhandled rejection at: ${promise} | ${reason}`);
	}

	async shutdown() {
		if (this.shutdownInProgress) return;
		this.shutdownInProgress = true;

		if (this.app) {
			this.logger.info('Initiating shutdown');
			this.app.kill('SIGTERM');

			await new Promise(resolve => setTimeout(resolve, CONFIG.gracefulTimeout));

			if (this.app.killed) {
				this.logger.info('Process terminated successfully');
			} else {
				this.logger.warn('Force terminating unresponsive process');
				this.app.kill('SIGKILL');
			}
		}

		process.exit(0);
	}
}

const manager = new ProcessManager();
manager.start();
