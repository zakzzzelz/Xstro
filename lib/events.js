import {
  Antilink,
  AntiSpammer,
  AntiViewOnce,
  AntiWord,
  AutoKick,
  schedules,
  updateGroupMetadata,
  StickerCMD,
  AntiDelete,
} from '#bot';
import { getConfig } from '#sql';
import { isJidGroup } from 'baileys';

export async function upserts(msg) {
  const tasks = [];
  const config = await getConfig();
  tasks.push(
    StickerCMD(msg),
    AntiDelete(msg),
    AntiViewOnce(msg),
    AntiSpammer(msg),
    updateGroupMetadata(msg.client)
  );
  if (!msg.isGroup) {
    if (config.disabledm && msg.from !== msg.user) return;
  }
  if (msg.isGroup) {
    if (isJidGroup(msg.from) && config.disablegc) return;
    tasks.push(Antilink(msg), schedules(msg), AntiWord(msg), AutoKick(msg));
  }
  await Promise.all(tasks);
}
