import { loadMessage } from '../sql/store.js';
import { format } from 'date-fns';
import { getAnti } from '../sql/antidel.js';

export const handleAntiDelete = async (conn, updates) => {
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
					const senderNumber = store.message.key.participant.split('@')[0];
					const deleterNumber = update.key.participant.split('@')[0];
					const deleteTime = format(new Date(), 'HH:mm:ss');

					let messageContent = msg.conversation || msg.extendedTextMessage?.text || msg.body || 'Message content not retrievable.';

					const notificationText = `*ᴀɴᴛɪᴅᴇʟᴇᴛᴇ ᴅᴇᴛᴇᴄᴛᴇᴅ*\n\n*ᴛɪᴍᴇ:* ${deleteTime}\n*ɢʀᴏᴜᴘ ᴄʜᴀᴛ:* ${groupName}\n*ᴅᴇʟᴇᴛᴇᴅ ʙʏ:* @${deleterNumber}\n*sᴇɴᴅᴇʀ:* @${senderNumber}\n\n*ᴄᴏɴᴛᴇɴᴛ:* ${messageContent}`;

					await conn.sendMessage(
						store.jid,
						{
							text: notificationText,
							contextInfo: {
								forwardingScore: 99999999,
								isForwarded: true,
								mentionedJid: [update.key.participant, store.message.key.participant],
							}
						},
						{
							quoted: store.message
						}
					);
				}
			}
		}
	}
};
