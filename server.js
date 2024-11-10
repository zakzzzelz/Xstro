import { fork } from 'child_process';
import path from 'path';
import os from 'os';

class ProcessManager {
	constructor(config = {}) {
		this.config = {
			maxRestarts: 5,
			restartDelay: 5000,
			appPath: path.join(process.cwd(), 'index.js'),
			...config,
		};
		this.state = { isRunning: false, restartCount: 0, process: null };
	}

	log(message, color = '\x1b[34m') {
		console.log(`${color}| xstro | ${message}\x1b[0m`);
	}

	start() {
		this.printHeader();
		this.log('Starting the process...', '\x1b[36m');
		this.startProcess();
	}

	printHeader() {
		console.log('\x1b[1m\x1b[32m\nPROCESS MANAGER\n\x1b[0m');
		console.log(`Platform: ${process.platform} | Arch: ${process.arch}`);
		console.log(`Memory: ${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB`);
		console.log(`CPU: ${os.cpus()[0].model} | Cores: ${os.cpus().length}\n`);
	}

	startProcess() {
		if (this.state.isRunning) return;

		this.state.isRunning = true;
		const childProcess = fork(this.config.appPath, [], { stdio: 'pipe' });
		this.state.process = childProcess;

		childProcess.stdout.on('data', data => this.handleChildLog(data, '\x1b[34m'));
		childProcess.stderr.on('data', data => this.handleChildLog(data, '\x1b[31m'));
		childProcess.on('exit', code => this.handleExit(code));
	}

	handleChildLog(data, color) {
		const message = data.toString().trim();
		if (message) this.log(message, color);
	}

	handleExit(code) {
		this.state.isRunning = false;
		if (code !== 0 && this.state.restartCount++ < this.config.maxRestarts) {
			this.log(`Restarting in ${this.config.restartDelay}ms...`, '\x1b[32m');
			setTimeout(() => this.startProcess(), this.config.restartDelay);
		} else {
			this.log('Max restarts reached. Stopping.', '\x1b[31m');
		}
	}
}

const manager = new ProcessManager();
manager.start();
