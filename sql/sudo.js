import fs from 'fs';
import path from 'path';

const store = path.join('store', 'sudo.json');

if (!fs.existsSync(store)) fs.writeFileSync(store, JSON.stringify([], null, 2));

const read = () => JSON.parse(fs.readFileSync(store, 'utf8'));
const write = (users) => fs.writeFileSync(store, JSON.stringify(users, null, 2));

function addSudo(jid = []) {
  if (!Array.isArray(jid)) jid = [jid];
  const users = read();

  let added = false;
  for (const id of jid) {
    if (!users.includes(id)) {
      users.push(id);
      added = true;
    }
  }
  if (added) write(users);
  return added;
}

function delSudo(jid = []) {
  if (!Array.isArray(jid)) jid = [jid];
  const users = read();
  let removed = false;

  for (const id of jid) {
    const index = users.indexOf(id);
    if (index !== -1) {
      users.splice(index, 1);
      removed = true;
    }
  }

  if (removed) write(users);
  return removed;
}

function getSudo() {
  const users = read();
  return users.length > 0 ? users : false;
}

function isSudo(jid = []) {
  if (!Array.isArray(jid)) jid = [jid];
  const users = read();

  for (const id of jid) {
    if (users.includes(id)) {
      return true;
    }
  }
  return false;
}

export { addSudo, delSudo, getSudo, isSudo };
