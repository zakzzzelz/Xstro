import fs from 'fs';
import path from 'path';

const store = path.join('store', 'bgm.json');

if (!fs.existsSync(store)) {
  fs.writeFileSync(store, JSON.stringify([]));
}

const readDB = () => JSON.parse(fs.readFileSync(store, 'utf8'));
const writeDB = (data) => fs.writeFileSync(store, JSON.stringify(data, null, 2));

async function addBgm(word, response) {
  if (!word || !response) {
    throw new Error('Both word and response are required');
  }

  const bgmList = readDB();
  const existingEntry = bgmList.find((entry) => entry.word === word.toLowerCase());

  if (existingEntry) {
    throw new Error(`BGM entry for word "${word}" already exists`);
  }

  const newEntry = { word: word.toLowerCase(), response };
  bgmList.push(newEntry);
  writeDB(bgmList);

  return newEntry;
}

async function getBgmResponse(word) {
  if (!word) {
    throw new Error('Word parameter is required');
  }

  const bgmList = readDB();
  const entry = bgmList.find((item) => item.word === word.toLowerCase());

  return entry ? entry.response : null;
}

async function deleteBgm(word) {
  if (!word) {
    throw new Error('Word parameter is required');
  }

  const bgmList = readDB();
  const index = bgmList.findIndex((item) => item.word === word.toLowerCase());

  if (index !== -1) {
    bgmList.splice(index, 1);
    writeDB(bgmList);
    return true;
  }

  return false;
}

async function getBgmList() {
  const bgmList = readDB();
  return bgmList.sort((a, b) => a.word.localeCompare(b.word));
}

export { addBgm, getBgmResponse, deleteBgm, getBgmList };
