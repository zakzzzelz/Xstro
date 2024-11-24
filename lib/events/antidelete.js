const messageStore = new Map();
import { downloadMediaMessage } from 'baileys';
import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { format } from 'date-fns';
import { getAnti } from '../sql/antidel.js';

export const storeMessage = async msg => {
	if (msg.key && msg.key.id) {
		if (msg.message?.imageMessage || msg.message?.videoMessage || msg.message?.audioMessage) {
			const buffer = await downloadMediaMessage(msg, 'buffer', {});
			const mediaType = Object.keys(msg.message)[0].replace('Message', '');
			const fileName = `${msg.key.id}.${mediaType}`;
			const filePath = join(process.cwd(), 'temp', fileName);
			await mkdir(dirname(filePath), { recursive: true });
			await writeFile(filePath, buffer);
			msg.localMediaPath = filePath;
		}
		messageStore.set(msg.key.id, msg);
	}
};

export const handleAntiDelete = async (conn, updates) => {
	for (const update of updates) {
		if (update.key && (update.update.deleteMessage || update.update?.message === null)) {
			const cachedMsg = messageStore.get(update.key.id);
			if (cachedMsg && cachedMsg.message) {
				const isGroup = cachedMsg.key.remoteJid.endsWith('@g.us');

				if (isGroup) {
					const antiDeleteStatus = await getAnti(cachedMsg.key.remoteJid);
					if (!antiDeleteStatus) continue;

					const groupMetadata = await conn.groupMetadata(cachedMsg.key.remoteJid);
					const groupName = groupMetadata.subject;
					const senderNumber = cachedMsg.key.participant.split('@')[0];
					const deleterNumber = update.key.participant.split('@')[0];
					const deleteTime = format(new Date(), 'HH:mm:ss');

					let messageContent;

					if (cachedMsg.message.extendedTextMessage) {
						messageContent = {
							text: cachedMsg.message.extendedTextMessage.text,
						};

						const notificationText = `*ᴀɴᴛɪᴅᴇʟᴇᴛᴇ ᴅᴇᴛᴇᴄᴛᴇᴅ*\n\n*ᴛɪᴍᴇ:* ${deleteTime}\n*ɢʀᴏᴜᴘ ᴄʜᴀᴛ:* ${groupName}\n*ᴅᴇʟᴇᴛᴇᴅ ʙʏ:* @${deleterNumber}\n*sᴇɴᴅᴇʀ:* @${senderNumber}\n\n*ᴄᴏɴᴛᴇɴᴛ:* ${messageContent.text}`;

						await conn.sendMessage(
							cachedMsg.key.remoteJid,
							{
								text: notificationText,
								contextInfo: {
									mentionedJid: [cachedMsg.key.participant, update.key.participant],
									isForwarded: true,
									forwardingScore: 999,
								},
							},
							{ quoted: cachedMsg },
						);
					} else if (cachedMsg.message.conversation) {
						messageContent = {
							text: cachedMsg.message.conversation,
						};

						const notificationText = `*ᴀɴᴛɪᴅᴇʟᴇᴛᴇ ᴅᴇᴛᴇᴄᴛᴇᴅ*\n\n*ᴛɪᴍᴇ:* ${deleteTime}\n*ɢʀᴏᴜᴘ ᴄʜᴀᴛ:* ${groupName}\n*ᴅᴇʟᴇᴛᴇᴅ ʙʏ:* @${deleterNumber}\n*sᴇɴᴅᴇʀ:* @${senderNumber}\n\n*ᴄᴏɴᴛᴇɴᴛ:* ${messageContent.text}`;

						await conn.sendMessage(
							cachedMsg.key.remoteJid,
							{
								text: notificationText,
								contextInfo: {
									mentionedJid: [cachedMsg.key.participant, update.key.participant],
									isForwarded: true,
									forwardingScore: 999,
								},
							},
							{ quoted: cachedMsg },
						);
					} else if (cachedMsg.message.imageMessage && cachedMsg.localMediaPath) {
						await conn.sendMessage(
							cachedMsg.key.remoteJid,
							{
								image: { url: cachedMsg.localMediaPath },
								contextInfo: {
									isForwarded: true,
									forwardingScore: 999,
								},
							},
							{ quoted: cachedMsg },
						);
					} else if (cachedMsg.message.videoMessage && cachedMsg.localMediaPath) {
						await conn.sendMessage(
							cachedMsg.key.remoteJid,
							{
								video: { url: cachedMsg.localMediaPath },
								contextInfo: {
									isForwarded: true,
									forwardingScore: 999,
								},
							},
							{ quoted: cachedMsg },
						);
					} else if (cachedMsg.message.audioMessage && cachedMsg.localMediaPath) {
						await conn.sendMessage(
							cachedMsg.key.remoteJid,
							{
								audio: { url: cachedMsg.localMediaPath },
								mimetype: 'audio/mpeg',
							},
							{ quoted: cachedMsg },
						);
					}
				}
				messageStore.delete(update.key.id);
			}
		}
	}
};

setInterval(() => {
	const oneHour = 60 * 60 * 1000;
	const now = Date.now();
	for (const [id, msg] of messageStore.entries()) {
		if (now - msg.messageTimestamp * 1000 > oneHour) {
			messageStore.delete(id);
		}
	}
}, 60 * 60 * 1000);
