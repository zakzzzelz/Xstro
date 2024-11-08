import { fork } from 'child_process';
import path from 'path';
import os from 'os';
import cluster from 'cluster';
import { EventEmitter } from 'events';
import fs from 'fs/promises';

class ProcessManager extends EventEmitter {
	constructor(config = {}) {
		super();
		this.config = {
			maxRestarts: 5,
			restartDelay: 2000,
			workerCount: os.cpus().length,
			logPath: path.join(process.cwd(), 'logs'),
			appPath: path.join(process.cwd(), 'index.js'),
			useCluster: true,
			...config,
		};

		this.state = {
			isRunning: false,
			restartCount: 0,
			workers: new Map(),
		};

		this.setupErrorHandlers();
	}

	async start() {
		await fs.mkdir(this.config.logPath, { recursive: true });

		if (this.config.useCluster && cluster.isPrimary) {
			this.startCluster();
		} else {
			this.startSingleProcess();
		}
	}

	startCluster() {
		cluster.on('exit', (worker, code, signal) => {
			this.handleWorkerExit(worker, code, signal);
		});

		for (let i = 0; i < this.config.workerCount; i++) {
			this.createWorker();
		}
	}

	createWorker() {
		const worker = cluster.fork();
		this.state.workers.set(worker.id, {
			startTime: Date.now(),
			restarts: 0,
		});
	}

	handleWorkerExit(worker, code, signal) {
		const workerInfo = this.state.workers.get(worker.id);
		if (!workerInfo) return;

		this.state.workers.delete(worker.id);

		if (workerInfo.restarts < this.config.maxRestarts) {
			workerInfo.restarts++;
			setTimeout(() => this.createWorker(), this.config.restartDelay);
		} else {
			this.shutdown('Max restarts reached');
		}
	}

	startSingleProcess() {
		if (this.state.isRunning) return;

		this.state.isRunning = true;
		const childProcess = fork(this.config.appPath);

		childProcess.on('exit', code => {
			this.state.isRunning = false;
			if (code !== 0 && this.state.restartCount < this.config.maxRestarts) {
				this.state.restartCount++;
				setTimeout(() => this.startSingleProcess(), this.config.restartDelay);
			}
		});
	}

	setupErrorHandlers() {
		const shutdown = async reason => {
			await this.log(`Shutting down: ${reason}`);
			process.exit(1);
		};

		process.on('uncaughtException', err => shutdown(`Uncaught exception: ${err.message}`));
		process.on('unhandledRejection', err => shutdown(`Unhandled rejection: ${err.message}`));
		process.on('SIGTERM', () => shutdown('SIGTERM'));
		process.on('SIGINT', () => shutdown('SIGINT'));
	}

	async log(message) {
		const logEntry = `[${new Date().toISOString()}] ${message}\n`;
		await fs.appendFile(path.join(this.config.logPath, 'process-manager.log'), logEntry).catch(console.error);
	}

	async shutdown(reason) {
		if (this.config.useCluster && cluster.isPrimary) {
			for (const worker of Object.values(cluster.workers)) {
				worker.kill();
			}
		}
		await this.log(`Shutdown complete: ${reason}`);
		process.exit(0);
	}
}


const manager = new ProcessManager();
manager.start().catch(console.error);
