import { readdir } from 'fs/promises';
import { extname, join, dirname } from 'path';
import { fileURLToPath } from 'url';
import connect from './lib/bot.js';
import config from './config.js';
import net from 'net';

const __dirname = dirname(fileURLToPath(import.meta.url));
const log = (type, msg) => console.log(`[${type}] ${msg}`);

async function loadFiles(dir) {
   try {
   	const files = await readdir(dir, { withFileTypes: true });
   	for (const file of files) {
   		const fullPath = join(dir, file.name);
   		if (file.isDirectory()) await loadFiles(fullPath);
   		else if (extname(file.name) === '.js') await import(`file://${fullPath}`).catch(err => log('ERROR', `File: ${file.name} | ${err.message}`));
   	}
   } catch (err) {
   	log('ERROR', `Dir ${dir}: ${err.message}`);
   }
}

async function startBot() {
   try {
   	console.log('XSTRO MD');
   	await config.DATABASE.sync();
   	await loadFiles(join(__dirname, 'lib/sql'));
   	await loadFiles(join(__dirname, 'plugins'));
   	await connect();
   	await config.DATABASE.sync();
   } catch (err) {
   	log('ERROR', `Boot: ${err.message}`);
   }
}

(async () => {
   const server = net.createServer((socket) => {
       const responseHeaders = 'HTTP/1.1 200 OK\r\n' +
                               'Content-Type: text/plain\r\n' +
                               'Connection: keep-alive\r\n' +
                               'Keep-Alive: timeout=5, max=1000\r\n' +
                               'Content-Length: 2\r\n\r\n' +
                               'OK';

       const keepAliveInterval = setInterval(() => {
           try {
               socket.write(responseHeaders);
           } catch (error) {
               log('SOCKET ERROR', `Failed to write to socket: ${error.message}`);
               clearInterval(keepAliveInterval);
               socket.destroy();
           }
       }, 1000);

       socket.on('error', (err) => {
           log('SOCKET ERROR', `Socket error: ${err.message}`);
           clearInterval(keepAliveInterval);
           socket.destroy();
       });

       socket.on('close', () => {
           log('SOCKET', 'Socket closed');
           clearInterval(keepAliveInterval);
       });
   });

   server.on('error', (err) => {
       log('SERVER ERROR', `Server error: ${err.message}`);
       if (err.code === 'EADDRINUSE') {
           log('SERVER', 'Port 8000 is already in use');
       }
       process.exit(1);
   });

   server.listen(8000, () => {
       log('SERVER', 'TCP Health Check Server running on port 8000');
   });
})();

startBot();

process.on('SIGINT', () => {
   config.DATABASE.close();
   process.exit();
});
