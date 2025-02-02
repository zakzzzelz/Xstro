import fs from 'fs';
import path from 'path';

const store = path.join('store', 'group_events.json');

if (!fs.existsSync(store)) {
  fs.writeFileSync(store, JSON.stringify([], null, 2));
}

const readGroupEvents = () => JSON.parse(fs.readFileSync(store, 'utf8'));
const writeGroupEvents = (groupEvents) =>
  fs.writeFileSync(store, JSON.stringify(groupEvents, null, 2));

/**
 * Enables group events for a given JID.
 * @param {string} jid - The unique identifier (chat ID or JID).
 * @returns {Promise<boolean>} - Always returns true upon success.
 */
export const enableGroupEvents = async (jid) => {
  const groupEvents = readGroupEvents();
  const existingEvent = groupEvents.find((event) => event.jid === jid);

  if (existingEvent) {
    existingEvent.enabled = true;
  } else {
    groupEvents.push({ jid, enabled: true });
  }

  writeGroupEvents(groupEvents);
  return true;
};

/**
 * Disables group events for a given JID.
 * @param {string} jid - The unique identifier (chat ID or JID).
 * @returns {Promise<boolean>} - Always returns true upon success.
 */
export const disableGroupEvents = async (jid) => {
  const groupEvents = readGroupEvents();
  const existingEvent = groupEvents.find((event) => event.jid === jid);

  if (existingEvent) {
    existingEvent.enabled = false;
  } else {
    groupEvents.push({ jid, enabled: false });
  }

  writeGroupEvents(groupEvents);
  return true;
};

/**
 * Checks if group events are enabled for a given JID.
 * @param {string} jid - The unique identifier (chat ID or JID).
 * @returns {Promise<boolean>} - Returns true if group events are enabled, false otherwise.
 */
export const isGroupEventEnabled = async (jid) => {
  const groupEvents = readGroupEvents();
  const event = groupEvents.find((event) => event.jid === jid);
  return event ? event.enabled : false;
};
