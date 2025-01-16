import fs from 'fs';
import path from 'path';

const dbPath = path.join('store', 'mentions.json');

// Ensure the mentions file exists
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify([], null, 2));
}

const readMentions = () => JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const writeMentions = (mentions) => fs.writeFileSync(dbPath, JSON.stringify(mentions, null, 2));

/**
 * Sets a mention message for a specific JID.
 * @param {string} jid - The unique identifier (chat ID or JID).
 * @param {Object} message - The message data to associate with the JID.
 * @returns {Promise<boolean>} - Always returns true upon success.
 */
export async function setMention(jid, message) {
  const mentions = readMentions();
  const existingMention = mentions.find((mention) => mention.jid === jid);

  if (existingMention) {
    existingMention.message = message;
  } else {
    mentions.push({ jid, message });
  }

  writeMentions(mentions);
  return true;
}

/**
 * Deletes a mention for a specific JID.
 * @param {string} jid - The unique identifier (chat ID or JID).
 * @returns {Promise<boolean>} - Returns true if deletion was successful, false otherwise.
 */
export async function delMention(jid) {
  const mentions = readMentions();
  const updatedMentions = mentions.filter((mention) => mention.jid !== jid);

  if (mentions.length !== updatedMentions.length) {
    writeMentions(updatedMentions);
    return true;
  }

  return false;
}

/**
 * Checks if a mention exists for a specific JID.
 * @param {string} jid - The unique identifier (chat ID or JID).
 * @returns {Promise<boolean>} - Returns true if a mention exists, false otherwise.
 */
export async function isMention(jid) {
  const mentions = readMentions();
  return mentions.some((mention) => mention.jid === jid);
}

/**
 * Retrieves the mention message for a specific JID.
 * @param {string} jid - The unique identifier (chat ID or JID).
 * @returns {Promise<Object|null>} - The message data if it exists, otherwise null.
 */
export async function getMention(jid) {
  const mentions = readMentions();
  const mention = mentions.find((mention) => mention.jid === jid);
  return mention ? mention.message : null;
}
