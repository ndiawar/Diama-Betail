import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Fonction pour attendre un peu
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    console.log('Début du script generate-index.js');

    // Lire le manifest pour trouver les vrais fichiers
    const manifestPath = path.join(__dirname, 'build', 'manifest.json');
console.log('Manifest path:', manifestPath);

// Attendre que le manifest existe
let manifestExists = false;
let manifestWaitAttempts = 0;
const maxManifestWaitAttempts = 10;

while (manifestWaitAttempts < maxManifestWaitAttempts && !manifestExists) {
    manifestExists = fs.existsSync(manifestPath);
    console.log(`Tentative ${manifestWaitAttempts + 1}/${maxManifestWaitAttempts} - Manifest existe: ${manifestExists}`);
    
    if (!manifestExists) {
        manifestWaitAttempts++;
        if (manifestWaitAttempts < maxManifestWaitAttempts) {
            console.log('Attente de 2 secondes avant la prochaine tentative...');
            await sleep(2000);
        }
    }
}

if (!manifestExists) {
    console.error('Manifest.json non trouvé après plusieurs tentatives !');
    process.exit(1);
}

// Lire le manifest avec plusieurs tentatives
let manifest = null;
let manifestAttempts = 0;
const maxManifestAttempts = 5;

while (manifestAttempts < maxManifestAttempts && !manifest) {
    try {
        const manifestContent = fs.readFileSync(manifestPath, 'utf8');
        manifest = JSON.parse(manifestContent);
        console.log('Manifest chargé avec succès');
    } catch (error) {
        manifestAttempts++;
        console.log(`Tentative ${manifestAttempts}/${maxManifestAttempts} - Erreur lecture manifest: ${error.message}`);
        
        if (manifestAttempts < maxManifestAttempts) {
            console.log('Attente de 1 seconde avant la prochaine tentative...');
            await sleep(1000);
        }
    }
}

if (!manifest) {
    console.error('Impossible de charger le manifest après plusieurs tentatives');
    process.exit(1);
}

// Trouver le point d'entrée principal
const mainEntry = Object.values(manifest).find(entry => entry.isEntry);
console.log('Main entry:', mainEntry);

// Utiliser les noms de fichiers qui existent sur Render
let mainJsFile = mainEntry ? mainEntry.file : '';
const mainCssFile = mainEntry && mainEntry.css ? mainEntry.css[0] : '';

// Vérifier que le fichier JS existe réellement avec plusieurs tentatives
const jsFilePath = path.join(__dirname, 'build', mainJsFile);
console.log('Vérification du fichier JS:', jsFilePath);

// Essayer plusieurs fois avec un délai
let attempts = 0;
const maxAttempts = 5;
let fileExists = false;

while (attempts < maxAttempts && !fileExists) {
    fileExists = fs.existsSync(jsFilePath);
    console.log(`Tentative ${attempts + 1}/${maxAttempts} - Le fichier existe: ${fileExists}`);
    
    if (!fileExists) {
        attempts++;
        if (attempts < maxAttempts) {
            console.log('Attente de 1 seconde avant la prochaine tentative...');
            await sleep(1000);
        }
    }
}

if (!fileExists) {
    console.error(`Fichier JS non trouvé après ${maxAttempts} tentatives: ${jsFilePath}`);
    console.log('Fichiers disponibles dans build/assets:');
    const assetsDir = path.join(__dirname, 'build', 'assets');
    if (fs.existsSync(assetsDir)) {
        const files = fs.readdirSync(assetsDir);
        files.forEach(file => console.log(`  - ${file}`));
        
        // Chercher un fichier main-*.js
        const mainJsFiles = files.filter(file => file.startsWith('main-') && file.endsWith('.js'));
        if (mainJsFiles.length > 0) {
            console.log('Fichiers main-*.js trouvés:', mainJsFiles);
            // Utiliser le premier fichier main trouvé
            const fallbackJsFile = `assets/${mainJsFiles[0]}`;
            console.log(`Utilisation du fichier de fallback: ${fallbackJsFile}`);
            mainJsFile = fallbackJsFile;
        } else {
            console.error('Aucun fichier main-*.js trouvé !');
            process.exit(1);
        }
    } else {
        console.error('Dossier assets non trouvé !');
        process.exit(1);
    }
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
}

// Exécuter la fonction principale
main().catch(error => {
    console.error('Erreur lors de l\'exécution du script:', error);
    process.exit(1);
});