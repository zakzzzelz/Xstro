import { fork } from 'child_process';
import { resolve } from 'path';

const log = msg => console.log('\x1b[34m%s\x1b[0m', msg);
let app = null;
let isShuttingDown = false;
let restartAttempts = 0;
const MAX_RESTART_DELAY = 1500;

const calculateBackoff = () => {
    const delay = Math.min(500 * Math.pow(1.2, restartAttempts), MAX_RESTART_DELAY);
    restartAttempts++;
    return delay;
};

const shutdown = async () => {
    try {
        if (isShuttingDown || !app) return;
        isShuttingDown = true;

        app.kill('SIGTERM');
        await new Promise(r => setTimeout(r, 1000));

        if (!app.killed) {
            log('Force terminating process');
            app.kill('SIGKILL');
        }
    } catch (error) {
        log(`Shutdown error: ${error.message}`);
    } finally {
        process.exit(0);
    }
};

const start = () => {
    try {
        if (isShuttingDown) return;

        app = fork(resolve('server.js'), [], {
            stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
            env: { ...process.env, RESTART_COUNT: restartAttempts }
        });

        app.on('message', msg => {
            try {
                if (msg === 'app.kill') shutdown();
            } catch (error) {
                log(`Message handler error: ${error.message}`);
            }
        });

        app.on('exit', (code, signal) => {
            try {
                if (isShuttingDown) return;
                
                const exitReason = signal ? `signal ${signal}` : `code ${code}`;
                log(`Process exited (${exitReason})`);
                
                const delay = calculateBackoff();
                log(`Restarting in ${delay}ms (attempt ${restartAttempts})`);
                
                setTimeout(() => {
                    try {
                        start();
                    } catch (error) {
                        log(`Restart attempt failed: ${error.message}`);
                        setTimeout(start, calculateBackoff());
                    }
                }, delay);
            } catch (error) {
                log(`Exit handler error: ${error.message}`);
                setTimeout(start, calculateBackoff());
            }
        });

        app.on('error', err => {
            try {
                log(`Process error: ${err.message}`);
                if (!isShuttingDown) {
                    const delay = calculateBackoff();
                    log(`Restarting in ${delay}ms (attempt ${restartAttempts})`);
                    setTimeout(start, delay);
                }
            } catch (error) {
                log(`Error handler failed: ${error.message}`);
                setTimeout(start, calculateBackoff());
            }
        });

        setTimeout(() => {
            if (app && !app.killed) {
                restartAttempts = 0;
                log('Process stable - reset restart counter');
            }
        }, 5000);

    } catch (error) {
        log(`Start function error: ${error.message}`);
        setTimeout(start, calculateBackoff());
    }
};

const setupProcessHandlers = () => {
    ['SIGINT', 'SIGTERM'].forEach(signal => {
        process.on(signal, () => {
            try {
                shutdown();
            } catch (error) {
                log(`Signal handler error: ${error.message}`);
                process.exit(1);
            }
        });
    });

    process.on('uncaughtException', error => {
        log(`Uncaught exception: ${error.message}`);
        if (!isShuttingDown) {
            try {
                start();
            } catch (innerError) {
                log(`Restart after uncaught exception failed: ${innerError.message}`);
                setTimeout(start, calculateBackoff());
            }
        }
    });

    process.on('unhandledRejection', (reason, promise) => {
        log(`Unhandled rejection at: ${promise}\nReason: ${reason}`);
    });
};

process.setMaxListeners(2000);
setupProcessHandlers();
start();