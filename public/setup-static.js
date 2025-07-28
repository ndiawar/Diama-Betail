import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Configuration du build statique...');

// Chemins des fichiers
const buildDir = path.join(__dirname, 'build');

// Vérifier que le dossier build existe
if (!fs.existsSync(buildDir)) {
    console.error('❌ Dossier build non trouvé !');
    process.exit(1);
}

console.log('✅ Dossier build trouvé');

// 1. Créer le fichier _headers
console.log('1. Création du fichier _headers...');
const headersContent = `/*.css
  Content-Type: text/css

/*.js
  Content-Type: application/javascript

/*.json
  Content-Type: application/json

/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff`;
fs.writeFileSync(path.join(buildDir, '_headers'), headersContent);
console.log('✅ _headers créé');

// 2. Créer le fichier _redirects
console.log('2. Création du fichier _redirects...');
const redirectsContent = '/*    /index.html   200';
fs.writeFileSync(path.join(buildDir, '_redirects'), redirectsContent);
console.log('✅ _redirects créé');

// 3. Copier les favicons
console.log('3. Copie des favicons...');
const faviconFiles = ['favicon.svg', 'favicon.png', 'favicon.ico'];
faviconFiles.forEach(file => {
    const sourcePath = path.join(__dirname, file);
    const destPath = path.join(buildDir, file);
    
    if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, destPath);
        console.log(`✅ ${file} copié`);
    } else {
        console.log(`⚠️  ${file} non trouvé`);
    }
});

// 4. Générer index.html avec tous les CSS nécessaires
console.log('4. Génération de index.html...');
const htmlContent = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Diama - Tracking de Vaches</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="icon" type="image/png" href="/favicon.png" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <link rel="stylesheet" href="/assets/main.css">
    <link rel="stylesheet" href="/assets/Vaches.css">
    <link rel="stylesheet" href="/assets/Carte.css">
</head>
<body>
    <div id="root"></div>
    <script type="module" src="/assets/app.js"></script>
</body>
</html>`;

fs.writeFileSync(path.join(buildDir, 'index.html'), htmlContent);
console.log('✅ index.html généré');

// 5. Vérifier les fichiers principaux
console.log('5. Vérification des fichiers principaux...');
const requiredFiles = ['index.html', 'assets/app.js', 'assets/main.css', 'assets/Vaches.css', 'assets/Carte.css'];
let allFilesExist = true;

requiredFiles.forEach(file => {
    const filePath = path.join(buildDir, file);
    if (fs.existsSync(filePath)) {
        console.log(`✅ ${file} trouvé`);
    } else {
        console.log(`❌ ${file} manquant`);
        allFilesExist = false;
    }
});

if (allFilesExist) {
    console.log('\n🎉 Configuration du build statique terminée !');
} else {
    console.log('\n⚠️  Certains fichiers sont manquants');
    process.exit(1);
} 