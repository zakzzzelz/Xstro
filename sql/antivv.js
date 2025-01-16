import fs from 'fs';
import path from 'path';

const store = path.join('store', 'antiviewonce.json');

if (!fs.existsSync(store))
  fs.writeFileSync(store, JSON.stringify({ type: 'all', isEnabled: false }));

const readDB = () => JSON.parse(fs.readFileSync(store, 'utf8'));
const writeDB = (data) => fs.writeFileSync(store, JSON.stringify(data, null, 2));

async function setViewOnce(status) {
  const db = readDB();
  db.isEnabled = status;
  writeDB(db);
  return true;
}

async function isViewOnceEnabled() {
  const db = readDB();
  return db.isEnabled;
}

async function setViewOnceType(type) {
  const db = readDB();
  db.type = type;
  writeDB(db);
  return true;
}

async function getSettings() {
  const db = readDB();
  return db;
}

export { setViewOnce, isViewOnceEnabled, setViewOnceType, getSettings };
