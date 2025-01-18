import { getAntiDelete } from '#sql';
import { isMediaMessage, formatTime } from '#utils';
import { isJidGroup, jidNormalizedUser } from 'baileys';

export async function AntiDelete(msg) {
  if (!(await getAntiDelete())) return;
  if (!msg.message?.protocolMessage) return;

  const client = msg.client;

  if (isJidGroup(msg.from)) {
    // Antidelete for group chats
  } else {
    // Antidelete for personal chats
  }
}
