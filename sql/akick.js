import fs from 'fs';
import path from 'path';

const store = path.join('store', 'autokick.json');

const readDB = () => JSON.parse(fs.readFileSync(store, 'utf8'));
const writeDB = (data) => fs.writeFileSync(store, JSON.stringify(data, null, 2));

export const addAKick = async (groupJid, userJid) => {
  if (!fs.existsSync(store)) fs.writeFileSync(store, JSON.stringify([]));
  const data = readDB();
  if (data.some((record) => record.groupJid === groupJid && record.userJid === userJid)) {
    return false;
  }
  data.push({ groupJid, userJid });
  writeDB(data);
  return true;
};

export const delKick = async (groupJid, userJid) => {
  if (!fs.existsSync(store)) fs.writeFileSync(store, JSON.stringify([]));
  const data = readDB();
  const filteredData = data.filter(
    (record) => !(record.groupJid === groupJid && record.userJid === userJid)
  );
  writeDB(filteredData);
  return data.length !== filteredData.length;
};

export const getKicks = async (groupJid, userJid = null) => {
  if (!fs.existsSync(store)) fs.writeFileSync(store, JSON.stringify([]));
  const data = readDB();
  return data.filter(
    (record) => record.groupJid === groupJid && (!userJid || record.userJid === userJid)
  );
};
