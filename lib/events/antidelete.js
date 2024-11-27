import { loadMessage } from '../sql/store.js';
import { format } from 'date-fns';
import { getAnti } from '../sql/antidel.js';

export const handleAntiDelete = async (conn, updates) => {
	for (const update of updates) {
		if (update.key && (update.update.deleteMessage || update.update?.message === null)) {
			const cachedMsg = await loadMessage(update.key.id);
			if (cachedMsg && cachedMsg.message) {
				const msg = cachedMsg.message;
				const isGroup = cachedMsg.jid.endsWith('@g.us');

				if (isGroup) {
					const antiDeleteStatus = await getAnti(cachedMsg.jid);
					if (!antiDeleteStatus) continue;

					const groupMetadata = await conn.groupMetadata(cachedMsg.jid);
					const groupName = groupMetadata.subject;
					const senderNumber = cachedMsg.message.key.participant.split('@')[0];
					const deleterNumber = update.key.participant.split('@')[0];
					const deleteTime = format(new Date(), 'HH:mm:ss');

					let messageContent;

					if (msg.extendedTextMessage) {
						messageContent = { text: msg.extendedTextMessage.text };
					} else if (msg.conversation) {
						messageContent = { text: msg.conversation };
					}

					const notificationText = `*ᴀɴᴛɪᴅᴇʟᴇᴛᴇ ᴅᴇᴛᴇᴄᴛᴇᴅ*\n\n*ᴛɪᴍᴇ:* ${deleteTime}\n*ɢʀᴏᴜᴘ ᴄʜᴀᴛ:* ${groupName}\n*ᴅᴇʟᴇᴛᴇᴅ ʙʏ:* @${deleterNumber}\n*sᴇɴᴅᴇʀ:* @${senderNumber}\n\n*ᴄᴏɴᴛᴇɴᴛ:* ${messageContent.text}`;

					await conn.sendMessage(
						cachedMsg.jid,
						{
							text: notificationText,
							contextInfo: {
								mentionedJid: [cachedMsg.message.key.participant, update.key.participant],
								isForwarded: true,
								forwardingScore: 999,
							},
						},
						{ quoted: msg }
					);

					if (msg.imageMessage && cachedMsg.localMediaPath) {
						await conn.sendMessage(
							cachedMsg.jid,
							{
								image: { url: cachedMsg.localMediaPath },
								contextInfo: { isForwarded: true, forwardingScore: 999 },
							},
							{ quoted: msg }
						);
					} else if (msg.videoMessage && cachedMsg.localMediaPath) {
						await conn.sendMessage(
							cachedMsg.jid,
							{
								video: { url: cachedMsg.localMediaPath },
								contextInfo: { isForwarded: true, forwardingScore: 999 },
							},
							{ quoted: msg }
						);
					} else if (msg.audioMessage && cachedMsg.localMediaPath) {
						await conn.sendMessage(
							cachedMsg.jid,
							{
								audio: { url: cachedMsg.localMediaPath },
								mimetype: 'audio/mpeg',
							},
							{ quoted: msg }
						);
					}
				}
			}
		}
	}
};
