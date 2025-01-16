import fs from 'fs';
import path from 'path';
import { isJidGroup } from 'baileys';

const store = path.join('store', 'antispam.json');

if (!fs.existsSync(store)) fs.writeFileSync(store, JSON.stringify({}));

const readDB = () => JSON.parse(fs.readFileSync(store, 'utf8'));
const writeDB = (data) => fs.writeFileSync(store, JSON.stringify(data, null, 2));

async function setAntiSpam(jid, mode) {
  const normalizedJid = isJidGroup(jid) ? jid : 'global';
  const db = readDB();
  db[normalizedJid] = { mode };
  writeDB(db);
  return true;
}

async function getAntiSpamMode(jid) {
  const normalizedJid = isJidGroup(jid) ? jid : 'global';
  const db = readDB();
  const setting = db[normalizedJid];
  return setting ? setting.mode : 'off';
}

export { setAntiSpam, getAntiSpamMode };
