import express from 'express';
import dotenv from 'dotenv';
import connect from '#lib/client';
import loadFiles from '#lib/utils';
import getSession from '#lib/session';
import envlogger from '#lib/logger';
import DATABASE from '#lib/database';

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
