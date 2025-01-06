import { makeWASocket, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, DisconnectReason, Browsers, useMultiFileAuthState, isJidGroup, isJidBroadcast } from 'baileys';
import { EventEmitter } from 'events';
import config from '#config';
import Message from './class.js';
import { loadMessage, saveMessage, getGroupMetadata } from '#sql';
import { isLatest, getRandomProxy, manageProcess, toJid } from '#utils';
import { getConfigValues, upserts, commands, Plugins, serialize, logger, devs, logo } from '#lib';
import { ProxyAgent } from 'proxy-agent';
import { AntiCall, AntiDelete, Greetings } from '#bot';

EventEmitter.defaultMaxListeners = 2000;
process.setMaxListeners(2000);

export const client = async () => {
	const session = await useMultiFileAuthState('./session');
	const { state, saveCreds } = session;
	const { version } = await fetchLatestBaileysVersion();

	// Create a Random proxies for ban protections and saftey
	const proxy = new ProxyAgent(getRandomProxy());

	const sock = makeWASocket({
		auth: {
			creds: state.creds,
			// Use to speed up message sending
			keys: makeCacheableSignalKeyStore(state.keys, logger),
		},
		// Display QR code in the terminal for device linking
		printQRInTerminal: true,
		logger, // Logger (Custom)
		agent: proxy, // Proxy agent
		browser: Browsers.windows('Desktop'), // Windows for super i don't know
		version, // Same as baileys version
		keepAliveIntervalMs: 10000, // Ping pong socket
		syncFullHistory: false, // Too slow
		defaultQueryTimeoutMs: undefined,
		retryRequestDelayMs: 5000,
		markOnlineOnConnect: false, // Prevent marking online immediately upon connection
		fireInitQueries: true, // Yes
		emitOwnEvents: true, // Emit events triggered by the bot itself
		generateHighQualityLinkPreview: true, // Generate high-quality link previews necessary for contextInfo messages
		getMessage: async key => {
			// Fetch message from storage if available
			const store = await loadMessage(key.id);
			// if flase return null
			return store ? store : { conversation: null };
		},
		cachedGroupMetadata: async jid => {
			// Fetch group metadata from cache or return null
			const store = await getGroupMetadata(jid);
			// if it can't find just return null
			return store || null;
		},
		// shouldIgnoreJid: jid => isJidGroup(jid), //  jid to ignore
	});

	// Handle connection updates such as open, close, and connecting states
	sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
		if (connection === 'close') {
			// If the connection is closed, determine if it should reconnect
			lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut
				? client() // Reinitialize the client on disconnection
				: manageProcess(); // Manage process termination if logged out
		} else if (connection === 'open') {
			// Dynmaiclly fetch all the bot config from db
			const { mode, PREFIX } = await getConfigValues();

			// Filter the available commands to only commands that can be excuted by the user, not eventors cmds
			const cmds = commands.filter(cmd => cmd.pattern && !cmd.dontAddCommandList && !cmd.pattern.toString().includes('undefined')).length;

			// Connection messages

			let status = `BOT STARTED\n\nPrefix: ${PREFIX}\nPlugins: ${cmds}\nMode:${mode ? 'private' : 'public'}\nVersion: ${config.VERSION}`;
			const updated = await isLatest();
			if (!updated.latest) status += `\n\nOut Dated Version\nUse ${PREFIX}update now`;
			// Send a message indicating the bot's status
			const messageContent = {
				text: '```' + status + '```',
				contextInfo: {
					externalAdReply: {
						title: 'xsᴛʀᴏ ᴍᴅ',
						body: 'sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ʙʏ ᴀsᴛʀᴏx𝟷𝟷',
						thumbnail: logo,
						showAdAttribution: true,
						sourceUrl: 'https://chat.whatsapp.com/HIvICIvQ8hL4PmqBu7a2C6',
						mediaType: 1,
						renderLargerThumbnail: false,
						mediaUrl: 'https://chat.whatsapp.com/HIvICIvQ8hL4PmqBu7a2C6',
					},
				},
			};
			await sock.sendMessage(sock.user.id, messageContent); // Send bot status to self

			console.log(`Wa Version: ${version.join('.')}`);
		} else if (connection === 'connecting') {
			console.log('Connecting...');
		}
	});

	// Save creds
	sock.ev.on('creds.update', saveCreds);

	// Handle incoming messages and process them
	sock.ev.on('messages.upsert', async ({ messages, type }) => {
		if (type !== 'notify' || !messages[0].message) return; // if there's no message in the message or the message is a message from my or any other baileys bot ignore it

		// Broke it down to an easier usage and manipulation
		const msg = await serialize(JSON.parse(JSON.stringify(messages[0])), sock);

		// Con currently handle various events at a time without wasting time
		await Promise.all([
			Plugins(msg, sock, new Message(sock, msg)), // Plugins handler
			saveMessage(msg), // Save all messages that's processed
			upserts(msg), // All my custom events check `bot/`
		]);

		// Auto-read && status
		const { autoRead, autoStatusRead } = await getConfigValues();
		if (autoRead) await sock.readMessages([msg.key]);
		if (autoStatusRead && isJidBroadcast(msg.from)) await sock.readMessages([messages[0].key]);
	});

	// // Handle contact updates such as profile picture changes
	// sock.ev.on('contacts.update', async contacts => {
	// 	for (const contact of contacts) {
	// 		if (typeof contact.imgUrl !== 'undefined') {
	// 			const newUrl = contact.imgUrl === null ? null : await sock.profilePictureUrl(contact.id).catch(() => null);
	// 			console.log(`contact ${contact.id} has a new profile pic: ${newUrl}`);
	// 		}
	// 	}
	// });

	// sock.ev.on('contacts.upsert', async (contacts) => {
	// 	// contacts is already an array of Contact objects
	// 	for (const contact of contacts) {
	// 		console.log({
	// 			id: contact.id,
	// 			name: contact.name,
	// 			notify: contact.notify,
	// 			status: contact.status,
	// 			imgUrl: contact.imgUrl
	// 		});
	// 	}
	// });

	// // Group Created/Updated
	// sock.ev.on('groups.upsert', async groups => {
	// 	for (const group of groups) {
	// 		console.log('New/Updated Group:', {
	// 			id: group.id,
	// 			subject: group.subject,
	// 			creator: group.creator,
	// 			creation: group.creation,
	// 			participants: group.participants.length,
	// 		});
	// 	}
	// });

	// // Group Settings/Metadata Updated
	// sock.ev.on('groups.update', async updates => {
	// 	for (const update of updates) {
	// 		console.log('Group Update:', {
	// 			id: update.id,
	// 			subject: update.subject,
	// 			description: update.desc,
	// 			announce: update.announce,
	// 			locked: update.locked,
	// 		});
	// 	}
	// });

	// Participant Changes (add/remove/promote/demote)
	sock.ev.on('group-participants.update', async ({ id, participants, action, author }) => {
		const event = { Group: id, participants: participants, action: action, by: author };
		await Greetings(event, sock);
	});

	// // Join Requests
	// sock.ev.on('group.join-request', async ({ id, author, participant, action, method }) => {
	// 	console.log('Group Join Request:', {
	// 		groupId: id,
	// 		requestBy: author,
	// 		participant: participant,
	// 		action: action, // 'accept' | 'reject'
	// 		method: method, // 'invite_link' | 'direct_request'
	// 	});
	// });

	// AntiCall
	sock.ev.on('call', async calls => {
		await AntiCall(calls, sock);
	});

	// i only use this for messages that were been deleted
	sock.ev.on('messages.update', async updates => {
		// run antidelete
		await AntiDelete(sock, updates);
	});

	return sock;
};
