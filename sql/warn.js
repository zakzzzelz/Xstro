import fs from 'fs';
import path from 'path';

const store = path.join('store', 'warnings.json');

if (!fs.existsSync(store)) {
  fs.writeFileSync(store, JSON.stringify([], null, 2));
}

const readWarnings = () => JSON.parse(fs.readFileSync(store, 'utf8'));
const writeWarnings = (warnings) => fs.writeFileSync(store, JSON.stringify(warnings, null, 2));

/**
 * Adds a warning to a user or creates a new user with one warning.
 * @param {string} jid - The unique identifier of the user.
 * @returns {Promise<{success: boolean, warnings: number}>} Object containing success status and current warning count.
 */
const addWarn = async (jid) => {
  const warnings = readWarnings();
  let user = warnings.find((u) => u.jid === jid);

  if (!user) {
    user = { jid, warnings: 0 };
    warnings.push(user);
  }

  user.warnings += 1;
  writeWarnings(warnings);

  return { success: true, warnings: user.warnings };
};

/**
 * Retrieves the number of warnings for a user.
 * @param {string} jid - The unique identifier of the user.
 * @returns {Promise<{success: boolean, warnings: number}>} Object containing success status and warning count.
 */
const getWarn = async (jid) => {
  const warnings = readWarnings();
  const user = warnings.find((u) => u.jid === jid);

  return { success: true, warnings: user ? user.warnings : 0 };
};

/**
 * Resets the warning count for a user.
 * @param {string} jid - The unique identifier of the user.
 * @returns {Promise<{success: boolean}>} Object containing success status.
 */
const resetWarn = async (jid) => {
  const warnings = readWarnings();
  const user = warnings.find((u) => u.jid === jid);

  if (user) {
    user.warnings = 0;
    writeWarnings(warnings);
  }

  return { success: true };
};

/**
 * Checks if a user has any warnings.
 * @param {string} jid - The unique identifier of the user.
 * @returns {Promise<boolean>} True if the user has warnings, false otherwise.
 */
const isWarned = async (jid) => {
  const warnings = readWarnings();
  const user = warnings.find((u) => u.jid === jid);

  return user ? user.warnings > 0 : false;
};

export { addWarn, getWarn, resetWarn, isWarned };
