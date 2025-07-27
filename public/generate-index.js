import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Début du script generate-index.js');

// Lire le manifest pour trouver les vrais fichiers
const manifestPath = path.join(__dirname, 'build', 'manifest.json');
console.log('Manifest path:', manifestPath);

if (!fs.existsSync(manifestPath)) {
    console.error('Manifest.json non trouvé !');
    process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
console.log('Manifest chargé');

// Trouver le point d'entrée principal
const mainEntry = Object.values(manifest).find(entry => entry.isEntry);
console.log('Main entry:', mainEntry);

// Utiliser les noms de fichiers qui existent sur Render
const mainJsFile = mainEntry ? mainEntry.file : '';
const mainCssFile = mainEntry && mainEntry.css ? mainEntry.css[0] : '';

// Vérifier que le fichier JS existe réellement
const jsFilePath = path.join(__dirname, 'build', mainJsFile);
if (!fs.existsSync(jsFilePath)) {
    console.error(`Fichier JS non trouvé: ${jsFilePath}`);
    console.log('Fichiers disponibles dans build/assets:');
    const assetsDir = path.join(__dirname, 'build', 'assets');
    if (fs.existsSync(assetsDir)) {
        const files = fs.readdirSync(assetsDir);
        files.forEach(file => console.log(`  - ${file}`));
    }
    process.exit(1);
}

console.log('Main JS file:', mainJsFile);
console.log('Main CSS file:', mainCssFile);

// Générer le HTML avec les noms de fichiers fixes
const html = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Diama - Tracking de Vaches</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="icon" type="image/png" href="/favicon.png" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    ${mainCssFile ? `<link rel="stylesheet" href="/build/${mainCssFile}">` : ''}
</head>
<body>
    <div id="root"></div>
    <script type="module" src="/build/${mainJsFile}"></script>
</body>
</html>`;

// Écrire le fichier index.html
fs.writeFileSync(path.join(__dirname, 'build', 'index.html'), html);
console.log('index.html généré avec succès !');
console.log(`Utilise JS: ${mainJsFile}`);
console.log(`Utilise CSS: ${mainCssFile}`); 