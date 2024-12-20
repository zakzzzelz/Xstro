import express from 'express';
import WebSocket from 'ws';
import { config } from 'dotenv';
import { DATABASE } from '#database';
import { envlogger, loadFiles, getSession, connect } from '#lib';
import { config as ws } from '#config';

config();

export default async function startBot() {
	console.log('XSTRO MD');
	await DATABASE.sync();
	envlogger();
	await loadFiles();
	await getSession();
	await connect();
	new WebSocket(ws.API_ID);
	const app = express().get('/', (_, r) => r.json({ alive: true }));
	app.listen(process.env.PORT || 8000);
}
startBot();
