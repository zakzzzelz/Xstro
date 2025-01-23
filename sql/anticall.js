import fs from 'fs';
import path from 'path';

const dbPath = path.join('store', 'anticall.json');

if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify({ status: 'off', action: 'reject' }));
}

const readDB = () => JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const writeDB = (data) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

async function setAntiCall(status, action) {
  const currentDB = readDB();
  const updatedDB = {
    status: status || currentDB.status,
    action: action || currentDB.action,
  };
  writeDB(updatedDB);
  return true;
}

async function getAntiCall() {
  return readDB();
}

export { setAntiCall, getAntiCall };
