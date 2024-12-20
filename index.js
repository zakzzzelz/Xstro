import express from 'express';
import { config } from 'dotenv';
import { DATABASE } from '#lib/database';
import { envlogger, loadFiles, getSession, connect } from '#lib';

config();

export default async function startBot() {
	console.log('XSTRO MD');
	console.log('Syncing Database');
	await DATABASE.sync();
	envlogger();
	console.log('Loading Files');
	await loadFiles();
	console.log('Connecting to Session');
	await getSession();
	await connect();
	const app = express().get('/', (_, r) => r.json({ alive: true }));
	app.listen(process.env.PORT || 8000);
}
startBot();
