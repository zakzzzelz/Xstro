import fs from 'fs';

const data = (() => {
  try {
    return JSON.parse(fs.readFileSync('./lang/en.json', 'utf8'));
  } catch (error) {
    console.error('Error reading JSON file:', error);
    return {};
  }
})();

export const LANG = new Proxy(data, {
  get: (target, prop) => target[prop] || null,
});
