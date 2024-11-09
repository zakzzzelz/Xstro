import { fork } from 'child_process';
import path from 'path';
import os from 'os';
import ora from 'ora';
import chalk from 'chalk';

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

	log(message, type = 'blue') {
		const colors = { blue: chalk.blue, green: chalk.green, red: chalk.red, yellow: chalk.yellow };
		console.log(colors[type](`| xstro | ${message}`));
	}

	async start() {
		this.printHeader();
		const spinner = ora('Starting the process...').start();
		try {
			this.startProcess();
			spinner.succeed('Process started.');
		} catch (err) {
			spinner.fail('Failed to start process.');
			this.log(err, 'red');
		}
	}

	printHeader() {
		console.log(chalk.bold.green('\nPROCESS MANAGER\n'));
		console.log(chalk.blue(`Platform: ${process.platform} | Arch: ${process.arch}`));
		console.log(chalk.blue(`Memory: ${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB`));
		console.log(chalk.blue(`CPU: ${os.cpus()[0].model} | Cores: ${os.cpus().length}\n`));
		console.log(chalk.yellow('-----------------------------------'));
		console.log(chalk.yellow('| xstro | events                  |'));
		console.log(chalk.yellow('| xstro | starting the process...   |'));
		console.log(chalk.yellow('-----------------------------------\n'));
	}

	startProcess() {
		if (this.state.isRunning) return;

		this.state.isRunning = true;
		const childProcess = fork(this.config.appPath, [], { stdio: 'pipe' });

		this.state.process = childProcess;

		childProcess.stdout.on('data', data => this.handleChildLog(data, 'blue'));
		childProcess.stderr.on('data', data => this.handleChildLog(data, 'red'));
		childProcess.on('exit', code => this.handleExit(code));
		childProcess.on('error', error => this.log(error, 'red'));
	}

	handleChildLog(data, type) {
		const message = data.toString().trim();
		if (message) {
			this.log(message, type);
		}
	}

	handleExit(code) {
		if (code !== 0) {
			this.state.restartCount++;
			if (this.state.restartCount <= this.config.maxRestarts) {
				this.log(`Restarting in ${this.config.restartDelay}ms...`, 'green');
				setTimeout(() => this.startProcess(), this.config.restartDelay);
			} else {
				this.log('Max restarts reached. Stopping.', 'red');
			}
		}
		this.state.isRunning = false;
	}
}

const manager = new ProcessManager();
manager.start();
