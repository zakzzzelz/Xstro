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

// Start server immediately, even if async tasks are still running
app.listen(PORT, async () => {
    try {
        console.log(`Server listening on port ${PORT}`);
        await loadFiles();
        await config.DATABASE.sync();
        await getSession();
        await connect();
    } catch (err) {
        console.error('Error during startup:', err);
        process.exit(1);
    }
});
