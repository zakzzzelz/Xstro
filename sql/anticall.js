import fs from 'fs';
import path from 'path';

const anticallStore = path.join('store', 'anticall.json');

if (!fs.existsSync(anticallStore)) {
  fs.writeFileSync(
    anticallStore,
    JSON.stringify({ id: 1, on: false, type: 'on', action: 'block', jid: null })
  );
}

const readDB = () => JSON.parse(fs.readFileSync(anticallStore, 'utf8'));
const writeDB = (data) => fs.writeFileSync(anticallStore, JSON.stringify(data, null, 2));

async function addAntiCall(type, action = 'block', jids = null) {
  if (!['block', 'reject'].includes(action)) {
    throw new Error('Action must be either block or reject');
  }

  if (type === 'on') {
    jids = null;
  } else if (type === 'all') {
    if (!Array.isArray(jids) || !jids.every((jid) => jid.length <= 4)) {
      throw new Error('All type requires array of country codes (max 4 chars)');
    }
  } else if (type === 'set') {
    if (!Array.isArray(jids) || !jids.every((jid) => jid.length >= 11)) {
      throw new Error('Set type requires array of full phone numbers (min 11 chars)');
    }
  }

  const record = readDB();
  record.on = true;
  record.type = type;
  record.action = action;
  record.jid = jids;
  writeDB(record);

  return true;
}

async function delAntiCall() {
  const record = readDB();
  record.on = false;
  writeDB(record);
  return true;
}

async function getAntiCall() {
  const record = readDB();
  return {
    on: record.on,
    type: record.type,
    action: record.action,
    jid: record.jid,
  };
}

async function editSpecificAntiCall(type, action, newJids, removeJids = []) {
  const record = readDB();

  let currentJids = record.jid || [];

  if (type) record.type = type;
  if (action) record.action = action;

  if (Array.isArray(newJids)) {
    if (type === 'all' && !newJids.every((jid) => jid.length <= 4)) {
      throw new Error('All type requires country codes (max 4 chars)');
    }
    if (type === 'set' && !newJids.every((jid) => jid.length >= 11)) {
      throw new Error('Set type requires full numbers (min 11 chars)');
    }
    currentJids = [...new Set([...currentJids, ...newJids])];
  }

  if (Array.isArray(removeJids)) {
    currentJids = currentJids.filter((jid) => !removeJids.includes(jid));
  }

  record.jid = type === 'on' ? null : currentJids;
  writeDB(record);

  return true;
}

async function isJidInAntiCall(jid) {
  const record = readDB();
  if (!record.on) return false;

  if (record.type === 'on') return true;

  if (record.type === 'all') {
    const countryCode = jid.slice(0, Math.min(jid.length, 4));
    return Array.isArray(record.jid) && record.jid.includes(countryCode);
  }

  if (record.type === 'set') {
    return Array.isArray(record.jid) && record.jid.includes(jid);
  }

  return false;
}

export { addAntiCall, delAntiCall, getAntiCall, editSpecificAntiCall, isJidInAntiCall };
