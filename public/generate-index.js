import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lire le manifest
const manifestPath = path.join(__dirname, 'build', 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

// Trouver le point d'entrée principal
const mainEntry = Object.values(manifest).find(entry => entry.isEntry);
const mainJs = mainEntry ? mainEntry.file : 'assets/main.js';
const mainCss = mainEntry && mainEntry.css ? mainEntry.css[0] : null;

// Timestamp pour forcer le cache
const timestamp = new Date().toISOString();

// Générer le HTML
const html = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Diama - Tracking de Vaches</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="icon" type="image/png" href="/favicon.png" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    ${mainCss ? `<link rel="stylesheet" href="/build/${mainCss}?v=${timestamp}">` : ''}
</head>
<body>
    <div id="root"></div>
    <script type="module" src="/build/${mainJs}?v=${timestamp}"></script>
</body>
</html>`;

// Écrire le fichier index.html
fs.writeFileSync(path.join(__dirname, 'build', 'index.html'), html);
console.log('index.html généré avec succès !'); 