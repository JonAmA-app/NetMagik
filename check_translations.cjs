
const fs = require('fs');
const content = fs.readFileSync('c:/Users/tecnicos/Desktop/Programas AI Studio/NetRig en desarrollo/src/constants.ts', 'utf8');

// Primitive way to extract objects - this might be fragile
function extractObject(name, text) {
  const start = text.indexOf(`${name} = {`);
  if (start === -1) return null;
  let count = 0;
  let end = -1;
  for (let i = start + name.length + 3; i < text.length; i++) {
    if (text[i] === '{') count++;
    if (text[i] === '}') {
      if (count === 0) {
        end = i;
        break;
      }
      count--;
    }
  }
  return text.substring(start, end + 1);
}

// Better way: look for the language keys in TRANSLATIONS
function getLangKeys(lang, text) {
    const langStart = text.indexOf(`${lang}: {`);
    if (langStart === -1) return [];
    const end = text.indexOf('},', langStart);
    const section = text.substring(langStart, end);
    const matches = section.match(/^\s*([a-zA-Z0-9_]+):/gm);
    if (!matches) return [];
    return matches.map(m => m.trim().replace(':', ''));
}

function getBaseKeys(text) {
    const start = text.indexOf('BASE_TRANSLATIONS = {');
    const end = text.indexOf('};', start);
    const section = text.substring(start, end);
    const matches = section.match(/^\s*([a-zA-Z0-9_]+):/gm);
    if (!matches) return [];
    return matches.map(m => m.trim().replace(':', ''));
}

const baseKeys = getBaseKeys(content);
const langs = ['es', 'pt', 'de', 'fr', 'zh', 'ja'];

langs.forEach(lang => {
    const langKeys = getLangKeys(lang, content);
    const missing = baseKeys.filter(k => !langKeys.includes(k));
    console.log(`--- ${lang} Missing ---`);
    console.log(missing.join(', '));
});
