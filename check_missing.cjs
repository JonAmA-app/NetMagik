const ts = require('typescript');
const fs = require('fs');

const content = fs.readFileSync('src/constants.ts', 'utf-8');
const sourceFile = ts.createSourceFile('constants.ts', content, ts.ScriptTarget.Latest, true);

let baseTranslations = {};
let translationsMap = {};

function visit(node) {
    if (ts.isVariableDeclaration(node) && node.name.text === 'BASE_TRANSLATIONS') {
        baseTranslations = parseObjectLiteral(node.initializer);
    }
    if (ts.isVariableDeclaration(node) && node.name.text === 'TRANSLATIONS') {
        translationsMap = parseObjectLiteral(node.initializer);
    }
    ts.forEachChild(node, visit);
}

function parseObjectLiteral(node) {
    let obj = {};
    if (!node || !ts.isObjectLiteralExpression(node)) return obj;
    for (const prop of node.properties) {
        if (ts.isPropertyAssignment(prop)) {
            let key = prop.name.text;
            if (!key && prop.name.escapedText) key = prop.name.escapedText;
            
            if (ts.isStringLiteral(prop.initializer)) {
                obj[key] = prop.initializer.text;
            } else if (ts.isObjectLiteralExpression(prop.initializer)) {
                obj[key] = parseObjectLiteral(prop.initializer);
            }
        }
    }
    return obj;
}

visit(sourceFile);

const baseKeys = Object.keys(baseTranslations);
console.log(`Base keys: ${baseKeys.length}`);

let issues = 0;
let missingKeys = {};

for (const [lang, langObj] of Object.entries(translationsMap)) {
    if (lang === 'en') continue;
    
    missingKeys[lang] = [];
    
    for (const key of baseKeys) {
        if (!(key in langObj)) {
            missingKeys[lang].push(key);
            issues++;
        }
    }
}

for (const lang of Object.keys(missingKeys)) {
    console.log(`\nLanguage: ${lang} is missing ${missingKeys[lang].length} keys.`);
    if (missingKeys[lang].length > 0) {
        console.log(`Examples: ${missingKeys[lang].slice(0, 10).join(', ')}`);
    }
}

console.log(`\nTotal missing translations: ${issues}`);
