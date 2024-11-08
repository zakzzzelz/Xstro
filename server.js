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
		if (this.state.isRunning) return;

		await this.displayStartupBanner();

		if (this.settings.clustering.enabled) {
			this.initializeCluster();
		} else {
			this.launchSingleProcess();
		}

		this.monitor.startMonitoring();
	}

	initializeCluster() {
		if (cluster.isPrimary) {
			for (let i = 0; i < this.settings.clustering.workerCount; i++) {
				this.createWorker();
			}

			cluster.on('exit', (worker, code, signal) => {
				this.handleWorkerExit(worker, code, signal);
			});
		} else {
			this.launchSingleProcess();
		}
	}

	createWorker() {
		const worker = cluster.fork();
		this.state.workers.set(worker.id, {
			startTime: Date.now(),
			restarts: 0,
		});
	}

	launchSingleProcess() {
		this.state.isRunning = true;
		this.state.startTime = Date.now();
		this.state.activeProcess = fork(this.settings.paths.app, [], {
			stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
			env: { ...process.env, RESTART_COUNT: this.state.restartCount },
		});

		this.attachProcessHandlers();
	}

	attachProcessHandlers() {
		const process = this.state.activeProcess;

		process.stdout.on('data', data => {
			this.logger.logOutput(data.toString());
		});

		process.stderr.on('data', data => {
			this.logger.logError(data.toString());
		});

		process.on('message', message => {
			this.logger.logMessage(message);
		});

		process.on('exit', this.handleProcessExit.bind(this));
		process.on('error', this.handleProcessError.bind(this));
	}

	async handleProcessExit(code, signal) {
		const uptime = (Date.now() - this.state.startTime) / 1000;
		this.state.metrics.uptime += uptime;
		this.state.isRunning = false;

		if (code !== 0 && this.state.restartCount < this.settings.limits.restartAttempts) {
			await this.restartApplication();
		} else if (this.state.restartCount >= this.settings.limits.restartAttempts) {
			await this.handleMaxRestartsReached();
		}
	}

	async handleProcessError(error) {
		await this.logger.logError(error.stack || error.message);
		this.emit('processError', error);
	}

	async restartApplication() {
		if (!this.state.isRunning) {
			this.state.restartCount++;
			this.state.metrics.restarts++;
			this.state.lastRestart = Date.now();

			setTimeout(() => this.launchApplication(), this.settings.intervals.restart);
		}
	}

	async handleMaxRestartsReached() {
		await this.logger.logError('Maximum restart attempts reached. Shutting down.');
		this.shutDown('MAX_RESTARTS_REACHED');
	}

	async shutDown(reason) {
		if (this.state.activeProcess) {
			this.state.activeProcess.kill();
		}

		if (this.settings.clustering.enabled && cluster.isPrimary) {
			for (const worker of Object.values(cluster.workers)) {
				worker.kill();
			}
		}

		await this.logger.logMessage(`Shutting down: ${reason}`);
		process.exit(0);
	}

	setupEventHandlers() {
		process.on('SIGTERM', () => this.shutDown('SIGTERM'));
		process.on('SIGINT', () => this.shutDown('SIGINT'));
		process.on('uncaughtException', error => {
			this.handleProcessError(error);
			this.shutDown('UNCAUGHT_EXCEPTION');
		});
		process.on('unhandledRejection', error => {
			this.handleProcessError(error);
			this.shutDown('UNHANDLED_REJECTION');
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
	}

	startMonitoring() {
		this.intervalId = setInterval(() => {
			this.checkSystemHealth();
			this.collectMetrics();
		}, this.manager.settings.intervals.monitoring);
	}

	async checkSystemHealth() {
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
		this.blockedAddresses = new Set();
		this.failedAttempts = new Map();
	}

	validateAccess(address) {
		if (this.blockedAddresses.has(address)) {
			return false;
		}

		if (!this.manager.settings.security.trustedIPs.includes(address)) {
			this.recordFailedAttempt(address);
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
		this.blockedAddresses.add(address);
		setTimeout(() => {
			this.blockedAddresses.delete(address);
			this.failedAttempts.delete(address);
		}, this.manager.settings.security.lockoutDuration);
	}
}

const processManager = new ProcessManager();
processManager.launchApplication().catch(console.error);
