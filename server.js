import fs from 'fs';
import path from 'path';
import { fork } from 'child_process';
import figlet from 'figlet';
import boxen from 'boxen';
import os from 'os';
import cluster from 'cluster';
import { EventEmitter } from 'events';
import crypto from 'crypto';

class ProcessManager extends EventEmitter {
	constructor(appSettings = {}) {
		super();
		this.settings = this.createSettings(appSettings);
		this.state = this.initializeState();
		this.logger = new EnhancedLogger(this.settings);
		this.monitor = new SystemMonitor(this);
		this.security = new SecurityGuard(this);
		this.setupEventHandlers();
	}

	createSettings(customSettings) {
		const baseSettings = {
			paths: {
				logs: path.resolve(process.cwd(), 'logs'),
				app: path.resolve(process.cwd(), 'index.js'),
			},
			limits: {
				restartAttempts: 5,
				memoryThreshold: 0.8,
				cpuThreshold: 0.9,
				logSize: 10 * 1024 * 1024,
			},
			intervals: {
				restart: 2000,
				monitoring: 30000,
				metrics: 60000,
			},
			clustering: {
				enabled: true,
				workerCount: os.cpus().length,
			},
			security: {
				auditEnabled: true,
				maxAttempts: 3,
				lockoutDuration: 300000,
				trustedIPs: ['127.0.0.1'],
			},
		};

		return this.mergeObjects(baseSettings, customSettings);
	}

	mergeObjects(target, source) {
		const result = { ...target };
		for (const [key, value] of Object.entries(source)) {
			result[key] = value && typeof value === 'object' ? this.mergeObjects(result[key] || {}, value) : value;
		}
		return result;
	}

	initializeState() {
		return {
			isRunning: false,
			startTime: null,
			restartCount: 0,
			lastRestart: null,
			activeProcess: null,
			workers: new Map(),
			metrics: {
				restarts: 0,
				crashes: 0,
				uptime: 0,
				failedChecks: 0,
				resourceUsage: {
					memory: [],
					cpu: [],
					disk: [],
				},
			},
			shutdownInProgress: false,
		};
	}

	async displayStartupBanner() {
		return new Promise(resolve => {
			figlet(
				'Process Manager',
				{
					font: 'Standard',
					horizontalLayout: 'default',
					verticalLayout: 'default',
				},
				(err, banner) => {
					if (!err) {
						const boxedBanner = boxen(banner, {
							padding: 1,
							margin: 1,
							borderStyle: 'double',
							borderColor: 'cyan',
							title: 'System Monitor',
							titleAlignment: 'center',
						});

						console.log(boxedBanner);
						console.log(`Running on ${os.type()} ${os.release()}`);
						console.log(`Total Memory: ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`);
						console.log(`Available CPUs: ${os.cpus().length}\n`);
					}
					resolve();
				},
			);
		});
	}

	async launchApplication() {
		if (this.state.isRunning || this.state.shutdownInProgress) {
			return;
		}

		try {
			await this.displayStartupBanner();
			await this.logger.logMessage('Starting application...');

			if (this.settings.clustering.enabled && cluster.isPrimary) {
				await this.initializeCluster();
			} else {
				await this.launchSingleProcess();
			}

			this.monitor.startMonitoring();
			await this.logger.logMessage('Application started successfully');
		} catch (error) {
			await this.logger.logError(`Launch failed: ${error.message}`);
			throw error;
		}
	}

	async initializeCluster() {
		await this.logger.logMessage(`Initializing cluster with ${this.settings.clustering.workerCount} workers`);

		cluster.on('exit', async (worker, code, signal) => {
			await this.handleWorkerExit(worker, code, signal);
		});

		for (let i = 0; i < this.settings.clustering.workerCount; i++) {
			await this.createWorker();
		}
	}

	async createWorker() {
		if (this.state.shutdownInProgress) return;

		const worker = cluster.fork();
		this.state.workers.set(worker.id, {
			startTime: Date.now(),
			restarts: 0,
			id: worker.id,
		});

		worker.on('message', async message => {
			await this.logger.logMessage(`Worker ${worker.id}: ${JSON.stringify(message)}`);
		});

		await this.logger.logMessage(`Created worker ${worker.id}`);
	}

	async handleWorkerExit(worker, code, signal) {
		if (this.state.shutdownInProgress) return;

		const workerInfo = this.state.workers.get(worker.id);
		if (!workerInfo) return;

		await this.logger.logError(`Worker ${worker.id} died with code ${code} and signal ${signal}`);
		this.state.workers.delete(worker.id);

		if (workerInfo.restarts < this.settings.limits.restartAttempts) {
			workerInfo.restarts++;
			setTimeout(async () => {
				await this.createWorker();
			}, this.settings.intervals.restart);
		} else {
			await this.handleMaxRestartsReached();
		}
	}

	async launchSingleProcess() {
		if (this.state.isRunning || this.state.shutdownInProgress) return;

		try {
			this.state.isRunning = true;
			this.state.startTime = Date.now();

			this.state.activeProcess = fork(this.settings.paths.app, [], {
				stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
				env: {
					...process.env,
					RESTART_COUNT: this.state.restartCount,
					PROCESS_ID: crypto.randomUUID(),
				},
			});

			this.attachProcessHandlers();
			await this.logger.logMessage('Process started successfully');
		} catch (error) {
			this.state.isRunning = false;
			await this.logger.logError(`Process launch failed: ${error.message}`);
			throw error;
		}
	}

	attachProcessHandlers() {
		const process = this.state.activeProcess;

		process.stdout.on('data', async data => {
			await this.logger.logOutput(data.toString());
		});

		process.stderr.on('data', async data => {
			await this.logger.logError(data.toString());
		});

		process.on('message', async message => {
			await this.logger.logMessage(message);
		});

		process.on('exit', async (code, signal) => {
			await this.handleProcessExit(code, signal);
		});

		process.on('error', async error => {
			await this.handleProcessError(error);
		});
	}

	async handleProcessExit(code, signal) {
		if (!this.state.isRunning || this.state.shutdownInProgress) return;

		const uptime = (Date.now() - this.state.startTime) / 1000;
		this.state.metrics.uptime += uptime;
		this.state.isRunning = false;

		await this.logger.logMessage(`Process exited with code ${code} and signal ${signal}`);

		if (code !== 0 && this.state.restartCount < this.settings.limits.restartAttempts) {
			this.state.restartCount++;
			this.state.metrics.restarts++;
			this.state.lastRestart = Date.now();

			await this.logger.logMessage(`Attempting restart ${this.state.restartCount} of ${this.settings.limits.restartAttempts}`);

			setTimeout(async () => {
				if (!this.state.shutdownInProgress) {
					try {
						await this.launchSingleProcess();
					} catch (error) {
						await this.logger.logError(`Restart failed: ${error.message}`);
					}
				}
			}, this.settings.intervals.restart);
		} else if (this.state.restartCount >= this.settings.limits.restartAttempts) {
			await this.handleMaxRestartsReached();
		}
	}

	async handleProcessError(error) {
		await this.logger.logError(error.stack || error.message);
		this.emit('processError', error);
	}

	async handleMaxRestartsReached() {
		await this.logger.logError('Maximum restart attempts reached. Shutting down.');
		await this.shutDown('MAX_RESTARTS_REACHED');
	}

	async shutDown(reason) {
		if (this.state.shutdownInProgress) return;

		this.state.shutdownInProgress = true;
		await this.logger.logMessage(`Initiating shutdown: ${reason}`);

		try {
			if (this.monitor) {
				this.monitor.stopMonitoring();
			}

			if (this.state.activeProcess) {
				this.state.activeProcess.kill();
				this.state.activeProcess = null;
			}

			if (this.settings.clustering.enabled && cluster.isPrimary) {
				for (const worker of Object.values(cluster.workers)) {
					worker.kill();
				}
			}

			this.state.isRunning = false;
			await this.logger.logMessage(`Shutdown complete: ${reason}`);

			// Give time for final logs to be written
			setTimeout(() => {
				process.exit(0);
			}, 1000);
		} catch (error) {
			await this.logger.logError(`Error during shutdown: ${error.message}`);
			process.exit(1);
		}
	}

	setupEventHandlers() {
		process.on('SIGTERM', async () => await this.shutDown('SIGTERM'));
		process.on('SIGINT', async () => await this.shutDown('SIGINT'));

		process.on('uncaughtException', async error => {
			await this.handleProcessError(error);
			await this.shutDown('UNCAUGHT_EXCEPTION');
		});

		process.on('unhandledRejection', async error => {
			await this.handleProcessError(error);
			await this.shutDown('UNHANDLED_REJECTION');
		});
	}
}

class EnhancedLogger {
	constructor(settings) {
		this.settings = settings;
		this.queue = Promise.resolve();
		this.ensureLogDirectory();
	}

	async ensureLogDirectory() {
		await fs.promises.mkdir(this.settings.paths.logs, { recursive: true });
	}

	async logOutput(message) {
		await this.log('output', message);
	}

	async logError(message) {
		await this.log('error', message);
	}

	async logMessage(message) {
		await this.log('message', typeof message === 'object' ? JSON.stringify(message) : message);
	}

	async log(type, message) {
		const timestamp = new Date().toISOString();
		const logEntry = {
			id: crypto.randomUUID(),
			timestamp,
			type,
			message,
			metadata: {
				pid: process.pid,
				memory: process.memoryUsage(),
				hostname: os.hostname(),
			},
		};

		this.queue = this.queue.then(() => fs.promises.appendFile(path.join(this.settings.paths.logs, `${type}.log`), JSON.stringify(logEntry) + '\n')).catch(console.error);
	}
}

class SystemMonitor {
	constructor(manager) {
		this.manager = manager;
		this.intervalId = null;
		this.isMonitoring = false;
	}

	startMonitoring() {
		if (this.isMonitoring) return;

		this.isMonitoring = true;
		this.intervalId = setInterval(() => {
			this.checkSystemHealth();
			this.collectMetrics();
		}, this.manager.settings.intervals.monitoring);
	}

	stopMonitoring() {
		if (this.intervalId) {
			clearInterval(this.intervalId);
			this.intervalId = null;
		}
		this.isMonitoring = false;
	}

	async checkSystemHealth() {
		if (!this.isMonitoring) return;

		const memoryUsage = process.memoryUsage().heapUsed / os.totalmem();
		const cpuUsage = process.cpuUsage();

		if (memoryUsage > this.manager.settings.limits.memoryThreshold) {
			await this.manager.logger.logError(`Memory usage critical: ${(memoryUsage * 100).toFixed(2)}%`);
		}

		if (cpuUsage.user > this.manager.settings.limits.cpuThreshold) {
			await this.manager.logger.logError(`CPU usage critical: ${(cpuUsage.user * 100).toFixed(2)}%`);
		}
	}

	async collectMetrics() {
		if (!this.isMonitoring) return;

		const metrics = {
			timestamp: Date.now(),
			memory: process.memoryUsage(),
			cpu: process.cpuUsage(),
			uptime: process.uptime(),
			system: {
				loadAverage: os.loadavg(),
				freeMemory: os.freemem(),
				totalMemory: os.totalmem(),
			},
		};

		await this.manager.logger.log('metrics', JSON.stringify(metrics));
	}
}

class SecurityGuard {
	constructor(manager) {
		this.manager = manager;
		this.blockedAddresses = new Map();
		this.failedAttempts = new Map();
	}

	validateAccess(address) {
		if (this.isBlocked(address)) {
			return false;
		}

		if (!this.manager.settings.security.trustedIPs.includes(address)) {
			this.recordFailedAttempt(address);
			return false;
		}

		return true;
	}

	isBlocked(address) {
		const blockInfo = this.blockedAddresses.get(address);
		if (!blockInfo) return false;

		if (Date.now() >= blockInfo.expiresAt) {
			this.blockedAddresses.delete(address);
			this.failedAttempts.delete(address);
			return false;
		}

		return true;
	}

	recordFailedAttempt(address) {
		const attempts = (this.failedAttempts.get(address) || 0) + 1;
		this.failedAttempts.set(address, attempts);

		if (attempts >= this.manager.settings.security.maxAttempts) {
			this.blockAddress(address);
		}
	}

	blockAddress(address) {
		const blockInfo = {
			timestamp: Date.now(),
			expiresAt: Date.now() + this.manager.settings.security.lockoutDuration,
		};

		this.blockedAddresses.set(address, blockInfo);

		setTimeout(() => {
			this.blockedAddresses.delete(address);
			this.failedAttempts.delete(address);
		}, this.manager.settings.security.lockoutDuration);
	}
}

const processManager = new ProcessManager();
processManager.launchApplication().catch(async error => {
	console.error('Failed to start process manager:', error);
	process.exit(1);
});
