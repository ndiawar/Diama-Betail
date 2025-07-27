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

const mainJsFile = mainEntry ? mainEntry.file : 'assets/main.js';
const mainCssFile = mainEntry && mainEntry.css ? mainEntry.css[0] : null;

console.log('Main JS file:', mainJsFile);
console.log('Main CSS file:', mainCssFile);

// Copier les fichiers avec des noms fixes
const buildDir = path.join(__dirname, 'build', 'assets');
const mainJsPath = path.join(__dirname, 'build', mainJsFile);
const mainCssPath = mainCssFile ? path.join(__dirname, 'build', mainCssFile) : null;

console.log('Build dir:', buildDir);
console.log('Main JS path:', mainJsPath);
console.log('Main CSS path:', mainCssPath);

// Copier main.js
if (fs.existsSync(mainJsPath)) {
    const targetJsPath = path.join(buildDir, 'main.js');
    fs.copyFileSync(mainJsPath, targetJsPath);
    console.log(`Copié ${mainJsFile} vers main.js`);
} else {
    console.error(`Fichier source non trouvé: ${mainJsPath}`);
}

// Copier main.css
if (mainCssPath && fs.existsSync(mainCssPath)) {
    const targetCssPath = path.join(buildDir, 'main.css');
    fs.copyFileSync(mainCssPath, targetCssPath);
    console.log(`Copié ${mainCssFile} vers main.css`);
} else {
    console.error(`Fichier CSS source non trouvé: ${mainCssPath}`);
}

// Générer le HTML avec les noms fixes
const html = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Diama - Tracking de Vaches</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="icon" type="image/png" href="/favicon.png" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <link rel="stylesheet" href="/build/assets/main.css">
</head>
<body>
    <div id="root"></div>
    <script type="module" src="/build/assets/main.js"></script>
</body>
</html>`;

// Écrire le fichier index.html
fs.writeFileSync(path.join(__dirname, 'build', 'index.html'), html);
console.log('index.html généré avec succès !'); 