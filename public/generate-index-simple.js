import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Début du script generate-index-simple.js');

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

// Copier les fichiers avec des noms fixes
const jsSourcePath = path.join(assetsDir, mainJsFile);
const jsDestPath = path.join(assetsDir, 'app.js');
const cssSourcePath = path.join(assetsDir, mainCssFile);
const cssDestPath = path.join(assetsDir, 'app.css');

// Copier le fichier JS
if (fs.existsSync(jsSourcePath)) {
    fs.copyFileSync(jsSourcePath, jsDestPath);
    console.log(`Fichier JS copié: ${mainJsFile} -> app.js`);
} else {
    console.error(`Fichier JS source non trouvé: ${jsSourcePath}`);
    process.exit(1);
}

// Copier le fichier CSS si il existe
if (mainCssFile && fs.existsSync(cssSourcePath)) {
    fs.copyFileSync(cssSourcePath, cssDestPath);
    console.log(`Fichier CSS copié: ${mainCssFile} -> app.css`);
}

// Copier le fichier index.html statique
const staticIndexPath = path.join(__dirname, 'build', 'index-static.html');
const finalIndexPath = path.join(__dirname, 'build', 'index.html');

if (fs.existsSync(staticIndexPath)) {
    fs.copyFileSync(staticIndexPath, finalIndexPath);
    console.log('index.html statique copié avec succès !');
} else {
    console.error('Fichier index-static.html non trouvé !');
    process.exit(1);
}

console.log('Script terminé avec succès !');
console.log('Fichiers utilisés: app.js, app.css'); 