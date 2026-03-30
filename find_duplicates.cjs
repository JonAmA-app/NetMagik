
const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\tecnicos\\Desktop\\Programas AI Studio\\NetRig en desarrollo\\src\\constants.ts', 'utf8');

function findDuplicates(objContent, objName, startLineOffset) {
    const lines = objContent.split(/\r?\n/);
    const keys = new Map();
    lines.forEach((line, index) => {
        const match = line.match(/^\s+([a-zA-Z0-9_]+):/);
        if (match) {
            const key = match[1];
            const actualLine = startLineOffset + index + 1;
            if (keys.has(key)) {
                console.log(`[!] Duplicate key "${key}" in object "${objName}" at line ${actualLine} (previous at line ${keys.get(key)})`);
            }
            keys.set(key, actualLine);
        }
    });
}

const lines = content.split(/\r?\n/);

// Find BASE_TRANSLATIONS
let baseStart = -1;
let baseEnd = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('const BASE_TRANSLATIONS = {')) baseStart = i;
    if (baseStart !== -1 && lines[i].trim() === '};') {
        baseEnd = i;
        break;
    }
}
if (baseStart !== -1) {
    findDuplicates(lines.slice(baseStart, baseEnd + 1).join('\n'), 'BASE_TRANSLATIONS', baseStart);
}

// Find languages in TRANSLATIONS
let insideTranslations = false;
let currentLang = null;
let langStart = -1;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('export const TRANSLATIONS')) insideTranslations = true;
    if (insideTranslations) {
        const langMatch = lines[i].match(/^\s+([a-z]{2}):\s+\{/);
        if (langMatch) {
            currentLang = langMatch[1];
            langStart = i;
        }
        if (currentLang && lines[i].trim() === '},') {
            findDuplicates(lines.slice(langStart, i + 1).join('\n'), currentLang, langStart);
            currentLang = null;
        }
    }
}
