import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Début du script generate-index-static.js');

// Chemins des fichiers
const buildDir = path.join(__dirname, 'build');
const assetsDir = path.join(__dirname, 'build', 'assets');

// Vérifier que le dossier build existe
if (!fs.existsSync(buildDir)) {
    console.error('Dossier build non trouvé !');
    process.exit(1);
}

// Vérifier que le dossier assets existe
if (!fs.existsSync(assetsDir)) {
    console.error('Dossier assets non trouvé !');
    process.exit(1);
}

// Lister tous les fichiers dans assets
const files = fs.readdirSync(assetsDir);
console.log('Fichiers disponibles dans assets:', files);

// Chercher les fichiers principaux
const mainJsFiles = files.filter(file => file.startsWith('main-') && file.endsWith('.js'));
const mainCssFiles = files.filter(file => file.startsWith('main-') && file.endsWith('.css'));

console.log('Fichiers JS main trouvés:', mainJsFiles);
console.log('Fichiers CSS main trouvés:', mainCssFiles);

if (mainJsFiles.length === 0) {
    console.error('Aucun fichier main-*.js trouvé !');
    process.exit(1);
}

// Utiliser le premier fichier main JS et CSS trouvé
const mainJsFile = mainJsFiles[0];
const mainCssFile = mainCssFiles.length > 0 ? mainCssFiles[0] : '';

console.log('Utilisation du fichier JS:', mainJsFile);
console.log('Utilisation du fichier CSS:', mainCssFile);

// Créer des copies avec des noms fixes
const fixedJsFile = 'app.js';
const fixedCssFile = 'app.css';

const jsSourcePath = path.join(assetsDir, mainJsFile);
const jsDestPath = path.join(assetsDir, fixedJsFile);
const cssSourcePath = path.join(assetsDir, mainCssFile);
const cssDestPath = path.join(assetsDir, fixedCssFile);

// Copier le fichier JS avec un nom fixe
if (fs.existsSync(jsSourcePath)) {
    fs.copyFileSync(jsSourcePath, jsDestPath);
    console.log(`Fichier JS copié: ${mainJsFile} -> ${fixedJsFile}`);
} else {
    console.error(`Fichier JS source non trouvé: ${jsSourcePath}`);
    process.exit(1);
}

// Copier le fichier CSS avec un nom fixe si il existe
if (mainCssFile && fs.existsSync(cssSourcePath)) {
    fs.copyFileSync(cssSourcePath, cssDestPath);
    console.log(`Fichier CSS copié: ${mainCssFile} -> ${fixedCssFile}`);
}

// Générer le HTML avec des noms de fichiers fixes
const html = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Diama - Tracking de Vaches</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="icon" type="image/png" href="/favicon.png" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    ${mainCssFile ? `<link rel="stylesheet" href="/build/assets/${fixedCssFile}">` : ''}
</head>
<body>
    <div id="root"></div>
    <script type="module" src="/build/assets/${fixedJsFile}"></script>
</body>
</html>`;

// Écrire le fichier index.html
fs.writeFileSync(path.join(buildDir, 'index.html'), html);
console.log('index.html généré avec succès !');
console.log(`Utilise JS: ${fixedJsFile}`);
console.log(`Utilise CSS: ${fixedCssFile}`); 