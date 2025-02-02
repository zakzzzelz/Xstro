import fs from 'fs';
import path from 'path';

const antibotStore = path.join('store', 'antibot.json');

const readDB = () => JSON.parse(fs.readFileSync(antibotStore, 'utf8'));
const writeDB = (data) => fs.writeFileSync(antibotStore, JSON.stringify(data, null, 2));

async function setAntibot(jid, enabled) {
  if (!fs.existsSync(antibotStore)) fs.writeFileSync(antibotStore, JSON.stringify([]));
  const data = readDB();
  const existingRecord = data.find((record) => record.jid === jid);

  if (existingRecord) {
    existingRecord.enabled = enabled;
  } else {
    data.push({ jid, enabled });
  }

  writeDB(data);
  return { jid, enabled };
}

async function delAntibot(jid) {
  if (!fs.existsSync(antibotStore)) fs.writeFileSync(antibotStore, JSON.stringify([]));
  const data = readDB();
  const filteredData = data.filter((record) => record.jid !== jid);
  writeDB(filteredData);
  return data.length !== filteredData.length;
}

async function getAntibot(jid) {
  if (!fs.existsSync(antibotStore)) fs.writeFileSync(antibotStore, JSON.stringify([]));
  const data = readDB();
  const record = data.find((record) => record.jid === jid);
  return record ? record.enabled : false;
}

export { setAntibot, delAntibot, getAntibot };
