import { commands } from '#lib';
import { getcmd } from '#sql';
import Message from '../lib/class.js';

export async function StickerCMD(msg) {
  if (msg.type === 'stickerMessage') {
    const stickerIdBase64 = Buffer.from(msg.message.stickerMessage.fileSha256);
    const stickerIdHex = Buffer.from(stickerIdBase64, 'base64').toString('hex');
    const stickerCmds = await getcmd();
    const data = stickerCmds.find((cmd) => cmd.id === stickerIdHex);
    if (!data) return;
    for (const command of commands) {
      const cmdName = command.pattern.toString().split(/\W+/)[1];
      if (cmdName === data.cmd) {
        await command.function(new Message(msg.client, msg), msg.body, { ...msg, ...msg.client });
        break;
      }
    }
  }
}
