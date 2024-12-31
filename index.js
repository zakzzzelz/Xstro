import { fork } from 'child_process';
import { resolve } from 'path';

process.setMaxListeners(2000);

const CONFIG = {
	scriptPath: resolve('./client/app.js'),
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
		return {
			info: msg => console.log('\x1b[34m%s\x1b[0m', msg),
			error: msg => console.log('\x1b[31m%s\x1b[0m', msg),
			warn: msg => console.log('\x1b[33m%s\x1b[0m', msg),
		};
	}

	start() {
		if (this.shutdownInProgress) return;

		this.logger.info(`Starting application from ${CONFIG.scriptPath}...`);

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
			this.logger.info('Received termination signal from child process');
			this.shutdown();
		}
	}

	handleExit(code) {
		if (this.shutdownInProgress) return;

		this.restartCount++;
		const message = code === 0 ? 'Application exited normally' : `Application crashed with code ${code}`;

		if (this.restartCount > CONFIG.maxRestarts) {
			this.logger.error(`Maximum restart attempts (${CONFIG.maxRestarts}) exceeded. Terminating.`);
			this.shutdown();
			return;
		}

		this.logger.warn(`${message}. Restart attempt ${this.restartCount}/${CONFIG.maxRestarts}`);
		setTimeout(() => this.start(), CONFIG.restartDelay);
	}

	handleError(error) {
		this.logger.error(`Child process error: ${error.message}`);
		if (!this.shutdownInProgress) this.start();
	}

	handleSigInt() {
		this.logger.info('Received interrupt signal');
		this.shutdown();
	}

	handleUnhandledRejection(reason, promise) {
		this.logger.error(`Unhandled Rejection at: ${promise}\nReason: ${reason}`);
	}

	async shutdown() {
		if (this.shutdownInProgress) return;
		this.shutdownInProgress = true;

		if (this.app) {
			this.logger.info('Gracefully shutting down...');
			this.app.kill('SIGTERM');

			await new Promise(resolve => setTimeout(resolve, CONFIG.gracefulTimeout));

			if (this.app.killed) {
				this.logger.info('Shutdown complete');
			} else {
				this.logger.warn('Force killing unresponsive process');
				this.app.kill('SIGKILL');
			}
		}

		process.exit(0);
	}
}

const manager = new ProcessManager();
manager.start();
