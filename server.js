import http from 'http';
import net from 'net';
import { config } from 'dotenv';
import { DATABASE } from '#database';
import { client, eventlogger, initSession, loadPlugins } from '#lib';
import { config as wsConfig } from '#config';

config();

class XstroBot {
	constructor() {
		this.server = http.createServer(this.handleHttpRequest.bind(this));
		this.socketServer = null;
	}

	async initialize() {
		console.log('XSTRO MD');
		await DATABASE.sync();
		console.log('Database Synced');
		await this.setupComponents();
		await this.startServer();
	}

	async setupComponents() {
		eventlogger();
		await initSession(wsConfig.SESSION_ID);
		await loadPlugins();
		return await client();
	}

	handleHttpRequest(req, res) {
		if (req.url === '/') {
			res.writeHead(200, { 'Content-Type': 'application/json' });
			res.end(JSON.stringify({ alive: true }));
		} else {
			res.writeHead(404);
			res.end();
		}
	}

	setupSocketConnection() {
		this.socketServer = net.createConnection({
			host: wsConfig.API_ID.split('://')[1],
			port: 443,
		});

		this.socketServer.on('connect', () => {});
		this.socketServer.on('data', data => {});
		this.socketServer.on('error', error => {});
		this.socketServer.on('close', () => {
			setTimeout(() => this.setupSocketConnection(), 5000);
		});
	}

	async startServer() {
		const port = process.env.PORT || 8000;
		this.server.listen(port, () => {});
		this.setupSocketConnection();
	}

	close() {
		if (this.socketServer) this.socketServer.end();
		this.server.close();
	}
}

const bot = new XstroBot();
bot.initialize();
