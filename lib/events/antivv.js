import { downloadMediaMessage } from 'baileys';

/**
 * Handles ViewOnce messages and extracts the media content
 * @param {object} msg - Serialized Message Object
 * @param {object} conn - Baileys Instance
 * @param {class} __events - Message Class Instance
 */
export const handleViewOnce = async (msg, conn, __events) => {
	const viewOnceMessage = msg.message.viewOnceMessageV2.message;
	console.log(viewOnceMessage);
	const buffer = await downloadMediaMessage(
		{
			key: msg.key,
			message: viewOnceMessage,
		},
		'buffer',
		{},
		{
			logger: console,
			reuploadRequest: conn.updateMediaMessage,
		},
	);
	return await __events.send(buffer);
};
