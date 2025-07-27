import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Début du script generate-index-vite.js');

// Chemins des fichiers
const buildDir = path.join(__dirname, 'build');
const assetsDir = path.join(__dirname, 'build', 'assets');

// Vérifier que les dossiers existent
if (!fs.existsSync(buildDir)) {
    console.error('Dossier build non trouvé !');
    process.exit(1);
}

if (!fs.existsSync(assetsDir)) {
    console.error('Dossier assets non trouvé !');
    process.exit(1);
}

// Lister tous les fichiers dans assets
const files = fs.readdirSync(assetsDir);
console.log('Fichiers disponibles dans assets:', files);

// Vérifier que app.js existe
const appJsPath = path.join(assetsDir, 'app.js');
const mainCssPath = path.join(assetsDir, 'main.css');

if (!fs.existsSync(appJsPath)) {
    console.error('Fichier app.js non trouvé !');
    console.log('Fichiers JS disponibles:', files.filter(f => f.endsWith('.js')));
    process.exit(1);
}

console.log('Fichier app.js trouvé !');

// Vérifier si main.css existe (selon le manifest)
const hasMainCss = fs.existsSync(mainCssPath);
console.log('Fichier main.css trouvé:', hasMainCss);

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
    ${hasMainCss ? '<link rel="stylesheet" href="/build/assets/main.css">' : ''}
</head>
<body>
    <div id="root"></div>
    <script type="module" src="/build/assets/app.js"></script>
</body>
</html>`;

// Écrire le fichier index.html
fs.writeFileSync(path.join(buildDir, 'index.html'), html);
console.log('index.html généré avec succès !');
console.log('Utilise JS: app.js');
console.log('Utilise CSS:', hasMainCss ? 'main.css' : 'aucun'); 