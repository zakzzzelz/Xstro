import { downloadMediaMessage, isJidGroup } from 'baileys';

export const getMessageContentFromStoreAndValue = async message => {
	if (!message) return;
	let type;
	let content;
	if (['conversation', 'extendedTextMessage'].includes(message.type)) {
		type = 'text';
		content = message.body;
	} else if (['imageMessage', 'videoMessage', 'audioMessage', 'stickerMessage', 'documentMessage'].includes(message.type)) {
		type = message.type.replace('Message', '').toLowerCase();
		if (message.message) {
			content = await downloadMediaMessage(message.message, 'buffer', {});
		} else {
			throw new Error('Media message content is missing.');
		}
	}
	return {
		type,
		content,
	};
};

export async function AntiDelete(update, conn) {
	if (update.key && update.update?.message === null) {
		const store = await loadMessage(update.key.id);
		if (isJidGroup(update.key.remoteJid)) {
			const sender = await store.message.sender;
			const deleter = update.update.key.participant;
			const content = await getMessageContentFromStoreAndValue(store.message);

			const contextInfo = {
				forwarded: true,
				forwardingScore: 1,
				isForwarded: true,
				mentionedJid: [sender, deleter],
			};
			const quoted = {
				key: { fromMe: false, participant: `0@s.whatsapp.net`, remoteJid: 'status@broadcast' },
				message: {
					contactMessage: {
						displayName: `AntiDelete`,
						vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;a,;;;\nFN:'Xstro'\nitem1.TEL;waid=${sender.split('@')[0]}:${sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
					},
				},
			};
			if (content.type === 'text') {
				return await conn.sendMessage(
					store.message.from,
					{
						text: `ᴅᴇᴛᴇᴄᴛᴇᴅ ᴀ ᴅᴇʟᴇᴛᴇᴅ ᴛᴇxᴛ ᴍᴇssᴀɢᴇ\n\nsᴇɴᴅᴇʀ: ${sender.split('@')[0]}\nᴅᴇʟᴇᴛᴇᴅ ʙʏ: ${deleter.split('@')[0]}\n\nᴍsɢ ᴄᴏɴᴛᴇɴᴛ:\n ${content.content}`,
						contextInfo,
					},
					{ quoted: quoted },
				);
			} else {
				const mediaOptions = {
					image: { image: content.content },
					video: { video: content.content },
					audio: { audio: content.content },
					document: { document: content.content },
					sticker: { sticker: content.content },
				};

				return await conn.sendMessage(
					store.message.from,
					{
						text: `ᴅᴇᴛᴇᴄᴛᴇᴅ ᴀ ᴅᴇʟᴇᴛᴇᴅ ${content.type} ᴍᴇssᴀɢᴇ\n\nsᴇɴᴅᴇʀ: ${sender}\nᴅᴇʟᴇᴛᴇᴅ ʙʏ: ${deleter}`,
						...mediaOptions[content.type],
						contextInfo,
					},
					{ quoted: quoted },
				);
			}
		}
	}
}
