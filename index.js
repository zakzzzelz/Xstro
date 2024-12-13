import express from 'express';
import dotenv from 'dotenv';
import connect from './lib/client.js';
import loadFiles from './lib/utils.js';
import getSession from './lib/session.js';
import envlogger from './lib/logger.js';
import DATABASE from './lib/database.js';

dotenv.config();

export default async function startBot() {
	console.log('XSTRO MD');
	envlogger();
	await loadFiles();
	await DATABASE.sync();
	await getSession();
	await connect();
	const app = express().get('/', (_, r) => r.json({ alive: true }));
	app.listen(process.env.PORT || 8000);
}
startBot();
