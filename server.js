import path from 'path';
import os from 'os';

class ProcessManager {
	constructor(config = {}) {
		this.config = {
			appPath: path.join(process.cwd(), 'index.js'),
			...config,
		};
		this.state = { isRunning: false, process: null };
	}

	log(message, color = '\x1b[34m') {
		console.log(`${color} ${message}\x1b[0m`);
	}

	start() {
		this.printHeader();
		this.log('Starting bot...', '\x1b[36m');
		this.startProcess();
	}

	printHeader() {
		this.log('PROCESS MANAGER', '\x1b[36m');
		this.log(`Platform: ${process.platform} | Arch: ${process.arch}`, '\x1b[36m');
		this.log(`Memory: ${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB`, '\x1b[36m');
		this.log(`CPU: ${os.cpus()[0].model} | Cores: ${os.cpus().length}`, '\x1b[36m');
	}

	async startProcess() {
		if (this.state.isRunning) return;

		this.state.isRunning = true;
		try {
			await import(this.config.appPath);
		} catch (error) {
			console.error('Failed to import the app:', error);
		}
	}
}

const manager = new ProcessManager();
manager.start();
