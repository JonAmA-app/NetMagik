
const fs = require('fs');
const content = fs.readFileSync('c:/Users/tecnicos/Desktop/Programas AI Studio/NetRig en desarrollo/src/constants.ts', 'utf8');

function getBaseKeys(text) {
    const start = text.indexOf('BASE_TRANSLATIONS = {');
    const end = text.indexOf('};', start);
    const section = text.substring(start, end);
    const matches = section.match(/^\s*([a-zA-Z0-9_]+):/gm);
    if (!matches) return [];
    return matches.map(m => m.trim().replace(':', ''));
}

function getLangKeys(lang, text) {
    const langStart = text.indexOf(`${lang}: {`);
    if (langStart === -1) return [];
    
    // Find matching closing brace for the object
    let count = 0;
    let end = -1;
    for (let i = langStart + lang.length + 3; i < text.length; i++) {
        if (text[i] === '{') count++;
        if (text[i] === '}') {
            if (count === 0) {
                end = i;
                break;
            }
            count--;
        }
    }
    
    const section = text.substring(langStart, end);
    const matches = section.match(/^\s*([a-zA-Z0-9_]+):/gm);
    if (!matches) return [];
    return matches.map(m => m.trim().replace(':', ''));
}

const baseKeys = getBaseKeys(content);
const langs = ['es', 'pt', 'de', 'fr', 'zh', 'ja'];
const report = {};

langs.forEach(lang => {
    const langKeys = getLangKeys(lang, content);
    const missing = baseKeys.filter(k => !langKeys.includes(k));
    report[lang] = missing;
});

fs.writeFileSync('c:/Users/tecnicos/Desktop/Programas AI Studio/NetRig en desarrollo/missing_report.json', JSON.stringify(report, null, 2));
