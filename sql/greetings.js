import fs from 'fs';
import path from 'path';

const store = path.join('store', 'greetings.json');

// Ensure the greetings file exists
if (!fs.existsSync(store)) {
  fs.writeFileSync(store, JSON.stringify([], null, 2));
}

const readGreetings = () => JSON.parse(fs.readFileSync(store, 'utf8'));
const writeGreetings = (greetings) => fs.writeFileSync(store, JSON.stringify(greetings, null, 2));

/**
 * Adds or updates a welcome greeting.
 * @param {string} jid - The unique identifier (chat ID or JID).
 * @param {boolean} action - The status (on/off).
 * @param {string|object|null} message - The message for the greeting, can be a string or JSON object.
 */
export async function addWelcome(jid, action, message) {
  const greetings = readGreetings();
  const existingWelcome = greetings.find(
    (greeting) => greeting.jid === jid && greeting.type === 'welcome'
  );

  if (existingWelcome) {
    existingWelcome.action = action;
    existingWelcome.message = message;
  } else {
    greetings.push({ jid, type: 'welcome', action, message });
  }

  writeGreetings(greetings);
}

/**
 * Adds or updates a goodbye greeting.
 * @param {string} jid - The unique identifier (chat ID or JID).
 * @param {boolean} action - The status (on/off).
 * @param {string|object|null} message - The message for the greeting, can be a string or JSON object.
 */
export async function addGoodbye(jid, action, message) {
  const greetings = readGreetings();
  const existingGoodbye = greetings.find(
    (greeting) => greeting.jid === jid && greeting.type === 'goodbye'
  );

  if (existingGoodbye) {
    existingGoodbye.action = action;
    existingGoodbye.message = message;
  } else {
    greetings.push({ jid, type: 'goodbye', action, message });
  }

  writeGreetings(greetings);
}

/**
 * Retrieves the welcome greeting for a given JID.
 * @param {string} jid - The unique identifier (chat ID or JID).
 * @returns {Promise<{action: boolean, message: string|null}>} The action and message for the welcome greeting.
 */
export async function getWelcome(jid) {
  const greetings = readGreetings();
  const data = greetings.find((greeting) => greeting.jid === jid && greeting.type === 'welcome');
  return data ? { action: data.action, message: data.message } : { action: false, message: null };
}

/**
 * Retrieves the goodbye greeting for a given JID.
 * @param {string} jid - The unique identifier (chat ID or JID).
 * @returns {Promise<{action: boolean, message: string|null}>} The action and message for the goodbye greeting.
 */
export async function getGoodbye(jid) {
  const greetings = readGreetings();
  const data = greetings.find((greeting) => greeting.jid === jid && greeting.type === 'goodbye');
  return data ? { action: data.action, message: data.message } : { action: false, message: null };
}

/**
 * Checks if the welcome greeting is enabled for a given JID.
 * @param {string} jid - The unique identifier (chat ID or JID).
 * @returns {Promise<boolean>} Whether the welcome greeting is on.
 */
export async function isWelcomeOn(jid) {
  const greetings = readGreetings();
  const data = greetings.find((greeting) => greeting.jid === jid && greeting.type === 'welcome');
  return data ? data.action : false;
}

/**
 * Checks if the goodbye greeting is enabled for a given JID.
 * @param {string} jid - The unique identifier (chat ID or JID).
 * @returns {Promise<boolean>} Whether the goodbye greeting is on.
 */
export async function isGoodByeOn(jid) {
  const greetings = readGreetings();
  const data = greetings.find((greeting) => greeting.jid === jid && greeting.type === 'goodbye');
  return data ? data.action : false;
}

/**
 * Deletes the welcome greeting for a given JID.
 * @param {string} jid - The unique identifier (chat ID or JID).
 */
export async function delWelcome(jid) {
  const greetings = readGreetings();
  const index = greetings.findIndex(
    (greeting) => greeting.jid === jid && greeting.type === 'welcome'
  );

  if (index !== -1) {
    greetings.splice(index, 1);
  }

  greetings.push({ jid, type: 'welcome', action: false, message: null });
  writeGreetings(greetings);
}

/**
 * Deletes the goodbye greeting for a given JID.
 * @param {string} jid - The unique identifier (chat ID or JID).
 */
export async function delGoodBye(jid) {
  const greetings = readGreetings();
  const index = greetings.findIndex(
    (greeting) => greeting.jid === jid && greeting.type === 'goodbye'
  );

  if (index !== -1) {
    greetings.splice(index, 1);
  }

  greetings.push({ jid, type: 'goodbye', action: false, message: null });
  writeGreetings(greetings);
}
