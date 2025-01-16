import fs from 'fs';
import path from 'path';

const store = path.join('store', 'antiword.json');

if (!fs.existsSync(store)) fs.writeFileSync(store, JSON.stringify([]));

const readDB = () => JSON.parse(fs.readFileSync(store, 'utf8'));
const writeDB = (data) => fs.writeFileSync(store, JSON.stringify(data, null, 2));

async function setAntiWordStatus(jid, action) {
  if (!jid) return;
  const db = readDB();
  let record = db.find((item) => item.jid === jid);

  if (!record) {
    record = { jid, status: action, words: [] };
    db.push(record);
  } else {
    record.status = action;
  }

  writeDB(db);

  return {
    success: true,
    message: `Antiword ${action ? 'enabled' : 'disabled'} for group ${jid}`,
  };
}

async function addAntiWords(jid, words) {
  if (!jid || !words) return;
  const db = readDB();
  let record = db.find((item) => item.jid === jid);

  if (!record) {
    record = { jid, status: false, words: words };
    db.push(record);
  } else {
    const uniqueWords = [...new Set([...record.words, ...words])];
    record.words = uniqueWords;
  }

  writeDB(db);

  return {
    success: true,
    message: `Added ${words.length} antiwords to group ${jid}`,
    addedWords: words,
  };
}

async function removeAntiWords(jid, words) {
  if (!jid) return;
  const db = readDB();
  const record = db.find((item) => item.jid === jid);

  if (!record) {
    return {
      success: false,
      message: `No antiwords found for group ${jid}`,
    };
  }

  record.words = record.words.filter((word) => !words.includes(word));
  writeDB(db);

  return {
    success: true,
    message: `Removed ${words.length} antiwords from group ${jid}`,
    removedWords: words,
  };
}

async function getAntiWords(jid) {
  if (!jid) return;
  const db = readDB();
  const record = db.find((item) => item.jid === jid);

  if (!record) {
    return {
      success: true,
      status: false,
      words: [],
    };
  }

  return {
    success: true,
    status: record.status,
    words: record.words,
  };
}

async function isAntiWordEnabled(jid) {
  if (!jid) return;
  const db = readDB();
  const record = db.find((item) => item.jid === jid);
  return record ? record.status : false;
}

export { setAntiWordStatus, addAntiWords, removeAntiWords, getAntiWords, isAntiWordEnabled };
