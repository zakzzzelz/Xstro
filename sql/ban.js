import fs from 'fs';
import path from 'path';

const store = path.join('store', 'ban.json');

if (!fs.existsSync(store)) {
  fs.writeFileSync(store, JSON.stringify([]));
}

const readDB = () => JSON.parse(fs.readFileSync(store, 'utf8'));
const writeDB = (data) => fs.writeFileSync(store, JSON.stringify(data, null, 2));

export const addBan = async (jid) => {
  if (!jid) throw new Error('JID is required.');

  const bannedUsers = readDB();
  if (!bannedUsers.includes(jid)) {
    bannedUsers.push(jid);
    writeDB(bannedUsers);
    return `_@${jid.split('@')[0]} has been banned from using commands._`;
  }
  return `_@${jid.split('@')[0]} is already banned._`;
};

export const removeBan = async (jid) => {
  if (!jid) throw new Error('JID is required.');

  const bannedUsers = readDB();
  const index = bannedUsers.indexOf(jid);
  if (index !== -1) {
    bannedUsers.splice(index, 1);
    writeDB(bannedUsers);
    return `_@${jid.split('@')[0]} unbanned, and can now use commands._`;
  }
  return `_@${jid.split('@')[0]} wasn't banned._`;
};

export const getBanned = async () => {
  return readDB();
};

export const isBanned = async (jid) => {
  if (!jid) jid = '';
  const bannedUsers = await getBanned();
  return bannedUsers.includes(jid);
};
