import { makeWASocket, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, DisconnectReason, Browsers } from 'baileys';
import { EventEmitter } from 'events';
import config from '#config';
import Message from './class.js';
import { loadMessage, saveMessage, getGroupMetadata } from '#sql';
import { isLatest, getRandomProxy, manageProcess } from '#utils';
import { getConfigValues, upserts, commands, Plugins, serialize, logger } from '#lib';
import { ProxyAgent } from 'proxy-agent';
import { SessionState } from '#client';
import { AntiDelete } from '#bot';

EventEmitter.defaultMaxListeners = 2000;
process.setMaxListeners(2000);

export const client = async () => {
	const session = await SessionState(config.SESSION_ID, logger);
	const { state, saveCreds } = session;
	const { version } = await fetchLatestBaileysVersion();
	const proxy = new ProxyAgent(getRandomProxy());

	const sock = makeWASocket({
		auth: {
			creds: state.creds,
			keys: makeCacheableSignalKeyStore(state.keys, logger),
		},
		printQRInTerminal: true,
		logger,
		agent: proxy,
		browser: Browsers.windows('Desktop'),
		version,
		keepAliveIntervalMs: 10000,
		syncFullHistory: false,
		defaultQueryTimeoutMs: undefined,
		retryRequestDelayMs: 5000,
		markOnlineOnConnect: false,
		fireInitQueries: true,
		emitOwnEvents: true,
		generateHighQualityLinkPreview: true,
		getMessage: async key => {
			const store = await loadMessage(key.id);
			if (store) return store;
			return { conversation: null };
		},
		cachedGroupMetadata: async jid => {
			const store = await getGroupMetadata(jid);
			if (store) return store;
			return null;
		},
	});

	sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
		if (connection === 'close') {
			lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut ? client() : manageProcess();
		} else if (connection === 'open') {
			const { mode, PREFIX } = await getConfigValues();
			const cmds = commands.filter(cmd => cmd.pattern && !cmd.dontAddCommandList && !cmd.pattern.toString().includes('undefined')).length;
			let status = `BOT STARTED\n\nPrefix: ${PREFIX}\nPlugins: ${cmds}\nMode:${mode ? 'private' : 'public'}\nVersion: ${config.VERSION}\nWaVersion: ${version}`;
			const updated = await isLatest();
			if (!updated.latest) status += `\n\nOut Dated Version\nUse ${PREFIX}update now`;

			await sock.sendMessage(sock.user.id, { text: '```' + status + '```' });
			console.log(`Wa Version: ${version}`);
		} else if (connection === 'connecting') {
			console.log('Connecting...');
		}
	});

	sock.ev.on('creds.update', saveCreds);
	sock.ev.on('messages.upsert', async ({ messages, type }) => {
		if (type !== 'notify' || !messages[0].message) return;
		const msg = await serialize(JSON.parse(JSON.stringify(messages[0])), sock);
		await Promise.all([Plugins(msg, sock, new Message(sock, msg)), saveMessage(msg), upserts(msg)]);
		const { autoRead, autoStatusRead } = await getConfigValues();
		if (autoRead) await sock.readMessages([msg.key]);
		if (autoStatusRead && msg.from === 'status@broadcast') await sock.readMessages([messages[0].key]);
	});
	sock.ev.on('messages.update', async updates => {
		await AntiDelete(sock, updates);
	});
	return sock;
};
