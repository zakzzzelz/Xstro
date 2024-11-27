import { downloadMediaMessage } from 'baileys';
import { getStatus } from '../sql/antivv.js';

/**
 * Handles ViewOnce messages and extracts the media content
 * @param {object} msg - Serialized Message Object
 * @param {object} conn - Baileys Instance
 * @param {class} __events - Message Class Instance
 */
export const handleViewOnce = async (msg, conn, __events) => {
  const viewOnceMessage = msg.message?.viewOnceMessageV2?.message;
  if (!viewOnceMessage) return;

  const antiVVStatus = await getStatus();
  if (!antiVVStatus) return;

  const isGroup = !!msg.from?.endsWith('@g.us');
  if ((antiVVStatus === 'dm' && isGroup) || (antiVVStatus === 'gc' && !isGroup)) {
    return;
  }

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
    }
  );

  return await __events.send(buffer, { jid: __events.user });
};
