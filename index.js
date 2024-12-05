/**
import express from 'express';
import dotenv from 'dotenv';
import connect from './lib/client.js';
import config from './config.js';
import loadFiles from './lib/utils.js';
import getSession from './lib/session.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.get('/', (req, res) => res.send('Server is running'));
app.listen(PORT);

(async () => {
	try {
		console.log('XSTRO MD');
		await loadFiles();
		await config.DATABASE.sync();
		await getSession();
		await connect();
	} catch (err) {
		console.error('Error during startup:', err);
		process.exit(1);
	}
})();
**/

import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.get('/', (req, res) => res.send('Server is running'));
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
