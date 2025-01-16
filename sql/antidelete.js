import fs from 'fs';
import path from 'path';

const store = path.join('store', 'antidelete.json');

if (!fs.existsSync(store))
  fs.writeFileSync(store, JSON.stringify({ id: 1, gc_status: false, dm_status: false }));

const readDB = () => JSON.parse(fs.readFileSync(store, 'utf8'));
const writeDB = (data) => fs.writeFileSync(store, JSON.stringify(data, null, 2));

async function initializeAntiDeleteSettings() {
  const record = readDB();
  if (!record) {
    writeDB({ id: 1, gc_status: false, dm_status: false });
  }
}

async function setAnti(type, status) {
  await initializeAntiDeleteSettings();
  const record = readDB();

  if (type === 'gc') {
    record.gc_status = status;
  } else if (type === 'dm') {
    record.dm_status = status;
  }

  writeDB(record);
  return true;
}

async function getAnti(type) {
  await initializeAntiDeleteSettings();
  const record = readDB();

  if (type === 'gc') {
    return record.gc_status;
  } else if (type === 'dm') {
    return record.dm_status;
  }

  return false;
}

async function getAllAntiDeleteSettings() {
  await initializeAntiDeleteSettings();
  const record = readDB();
  return [
    {
      gc_status: record.gc_status,
      dm_status: record.dm_status,
    },
  ];
}

export { setAnti, getAnti, getAllAntiDeleteSettings };
