import { downloadMediaMessage } from 'baileys';
import { loadMessage } from '../sql/store.js';
import { getAnti } from '../sql/antidel.js';

export const AntiDelete = async (conn, updates) => {
	for (const update of updates) {
		if (update.key && (update.update.deleteMessage || update.update?.message === null)) {
			const store = await loadMessage(update.key.id);

			if (store && store.message) {
				const msg = store.message;
				const isGroup = store.jid.endsWith('@g.us');

				if (isGroup) {
					const antiDeleteStatus = await getAnti(store.jid);
					if (!antiDeleteStatus) continue;

					const groupMetadata = await conn.groupMetadata(store.jid);
					const groupName = groupMetadata.subject;
					const senderNumber = msg.key.participant.split('@')[0];
					const deleterNumber = update.key.participant.split('@')[0];
					const deleteTime = new Date().toLocaleTimeString('en-US', { hour12: false });

					let notificationText = `*ᴀɴᴛɪᴅᴇʟᴇᴛᴇ ᴅᴇᴛᴇᴄᴛᴇᴅ*\n\n*ᴛɪᴍᴇ:* ${deleteTime}\n*ɢʀᴏᴜᴘ:* ${groupName}\n*ᴅᴇʟᴇᴛᴇᴅ ʙʏ:* @${deleterNumber}\n*sᴇɴᴅᴇʀ:* @${senderNumber}`;
					const mediaTypes = ['imageMessage', 'videoMessage', 'audioMessage'];
					const mediaType = mediaTypes.find(type => msg.message[type]);

					if (mediaType) {
						const mediaBuffer = await downloadMediaMessage(msg, 'buffer', {}, { logger: conn.logger });

						const captions = {
							imageMessage: 'Image attached.',
							videoMessage: 'Video attached.',
							audioMessage: 'Audio attached.',
						};

						notificationText += `\n\n*ᴄᴏɴᴛᴇɴᴛ:* ${captions[mediaType]}`;

						await conn.sendMessage(
							store.jid,
							{
								[mediaType === 'audioMessage' ? 'audio' : 'video']: mediaBuffer,
								caption: mediaType === 'audioMessage' ? '' : notificationText,
								ptt: mediaType === 'audioMessage',
								mimetype: msg.message[mediaType].mimetype,
								contextInfo: { mentionedJid: [update.key.participant, msg.key.participant] },
							},
							{ quoted: msg },
						);
					} else {
						const messageContent = msg.message?.conversation || msg.message?.extendedTextMessage?.text || 'Unknown content';
						notificationText += `\n\n*ᴄᴏɴᴛᴇɴᴛ:* ${messageContent}`;

						await conn.sendMessage(
							store.jid,
							{
								text: notificationText,
								contextInfo: { mentionedJid: [update.key.participant, msg.key.participant] },
							},
							{ quoted: msg },
						);
					}
				}
			}
		}
	}
};
