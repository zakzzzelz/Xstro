import http from 'http';
import net from 'net';
import { config } from 'dotenv';
import { DATABASE } from '#database';
import { client, eventlogger, initSession, loadPlugins } from '#lib';
import { config as wsConfig } from '#config';

config();

(async () => {
	const server = http.createServer((req, res) => {
		res.writeHead(req.url === '/' ? 200 : 404, { 'Content-Type': 'application/json' });
		res.end(req.url === '/' ? JSON.stringify({ alive: true }) : '');
	});

	const connectSocket = () => {
		const socket = net.createConnection({
			host: wsConfig.API_ID.split('://')[1],
			port: 443
		});

		socket.on('close', () => setTimeout(connectSocket, 5000));
		return socket;
	};

	console.log('XSTRO MD');
	await DATABASE.sync();
	eventlogger();
	await initSession(wsConfig.SESSION_ID);
	await loadPlugins();
	await client();

	server.listen(process.env.PORT || 8000);
	connectSocket();
})();
