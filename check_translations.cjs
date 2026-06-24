const ts = require('typescript');
const fs = require('fs');

const content = fs.readFileSync('src/constants.ts', 'utf-8');
const sourceFile = ts.createSourceFile('constants.ts', content, ts.ScriptTarget.Latest, true);

let baseTranslations = null;
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
        } else if (ts.isSpreadAssignment(prop)) {
            // skip spreads for now, assuming they spread BASE_TRANSLATIONS
        }
    }
    return obj;
}

visit(sourceFile);

const baseKeys = Object.keys(baseTranslations);
console.log(`Base keys: ${baseKeys.length}`);

let issues = 0;
let output = [];

for (const [lang, langObj] of Object.entries(translationsMap)) {
    if (lang === 'en') continue;

    // Spread assignments in AST weren't merged, so let's merge manually:
    // Actually, if they spread BASE_TRANSLATIONS, the langObj will only contain the OVERRIDDEN keys.
    // If they spread BASE_TRANSLATIONS, they won't have missing keys because TS and runtime both get all keys!
    // But the instructions for `depurar-traducciones` say: "audita archivos de idioma para identificar claves faltantes"
    // Wait, if they spread BASE_TRANSLATIONS, maybe the issue is *broken variables* in the overridden strings?
    console.log(`\nChecking language: ${lang}`);

    for (const key of Object.keys(langObj)) {
        if (!baseTranslations[key]) continue; // not in base

        const baseVal = baseTranslations[key];
        const transVal = langObj[key];

        if (typeof transVal !== 'string') continue;

        const getVars = (s) => {
            let m = s.match(/\$[a-zA-Z0-9_]+|\{[a-zA-Z0-9_]+\}/g) || [];
            return m.sort().join(',');
        };

        const baseVars = getVars(baseVal);
        const transVars = getVars(transVal);

        if (baseVars !== transVars) {
            console.log(`- Variable mismatch for key "${key}":`);
            console.log(`    Base (${baseVars}): ${baseVal}`);
            console.log(`    Trans (${transVars}): ${transVal}`);
            issues++;
        }
    }
}

console.log(`\nTotal issues found: ${issues}`);
