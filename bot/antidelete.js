import { getAntiDelete } from '#sql';
import { isMediaMessage, formatTime } from '#utils';
import { isJidGroup, jidNormalizedUser } from 'baileys';

export async function AntiDelete(msg) {
  if (!(await getAntiDelete())) return;
  // console.log(msg.type);
  // if (msg.type !== 'protocolMessage') return;
  // console.log(msg.ProtocolType);
  // if (msg.ProtocolType !== 'REVOKE') return;

  const client = msg.client;
  const store = await msg.client.loadMessage(msg.isProtocol.key.id);
  // console.log(msg.isProtocol);
  // console.log(store);

  if (isJidGroup(msg.from)) {
    // Antidelete for group chats
  } else {
    // Antidelete for personal chats
  }
}
