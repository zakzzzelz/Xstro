import fs from 'fs';
import path from 'path';

const store = path.join('store', 'antilink.json');

if (!fs.existsSync(store)) fs.writeFileSync(store, JSON.stringify({}));

const readDB = () => JSON.parse(fs.readFileSync(store, 'utf8'));
const writeDB = (data) => fs.writeFileSync(store, JSON.stringify(data, null, 2));

/**
 * Set or update the antilink configuration for a group.
 * @param {string} jid - The group ID.
 * @param {string} type - The configuration type ('on', 'off', 'action').
 * @param {string} action - The action to set ('delete', 'kick', 'warn', 'on', 'off').
 * @returns {Promise<boolean>} - Returns true if inserted/updated, false if already exists
 */
async function setAntilink(jid, type, action) {
  const db = readDB();
  const groupConfig = db[jid] || {};

  const existingConfig = groupConfig[type];
  if (existingConfig && existingConfig.action === action) return false;

  if (existingConfig) {
    groupConfig[type] = { action, warningCount: existingConfig.warningCount || 0 };
  } else {
    groupConfig[type] = { action, warningCount: 0 };
  }

  db[jid] = groupConfig;
  writeDB(db);
  return true;
}

/**
 * Get the antilink configuration for a group.
 * @param {string} jid - The group ID.
 * @param {string} type - The configuration type ('on', 'off', 'action').
 * @returns {Promise<object|null>} - Returns the configuration object or null.
 */
async function getAntilink(jid, type) {
  const db = readDB();
  const groupConfig = db[jid] || {};
  return groupConfig[type] || null;
}

/**
 * Remove antilink configuration for a specific type in a group.
 * @param {string} jid - The group ID.
 * @param {string} type - The configuration type to remove.
 * @returns {Promise<number>} - Number of rows destroyed
 */
async function removeAntilink(jid, type) {
  const db = readDB();
  const groupConfig = db[jid] || {};

  if (groupConfig[type]) {
    delete groupConfig[type];
    db[jid] = groupConfig;
    writeDB(db);
    return 1;
  }

  return 0;
}

/**
 * Save the warning count for a user in a group.
 * @param {string} jid - The group ID.
 * @param {string} type - The configuration type.
 * @param {number} count - The warning count.
 * @returns {Promise<void>}
 */
async function saveWarningCount(jid, type, count) {
  const db = readDB();
  const groupConfig = db[jid] || {};

  if (groupConfig[type]) {
    groupConfig[type].warningCount = count;
    db[jid] = groupConfig;
    writeDB(db);
  }
}

/**
 * Increment the warning count for a group.
 * @param {string} jid - The group ID.
 * @param {string} type - The configuration type.
 * @returns {Promise<number>} - Returns the new warning count.
 */
async function incrementWarningCount(jid, type) {
  const groupConfig = (readDB()[jid] || {})[type];
  const newCount = (groupConfig?.warningCount || 0) + 1;
  await saveWarningCount(jid, type, newCount);
  return newCount;
}

/**
 * Reset warning count for a group.
 * @param {string} jid - The group ID.
 * @param {string} type - The configuration type.
 * @returns {Promise<void>}
 */
async function resetWarningCount(jid, type) {
  await saveWarningCount(jid, type, 0);
}

export {
  setAntilink,
  removeAntilink,
  getAntilink,
  saveWarningCount,
  incrementWarningCount,
  resetWarningCount,
};
