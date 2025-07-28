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

// 3. Copier les favicons et autres fichiers statiques
console.log('3. Copie des fichiers statiques...');

// Favicons
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

// Copier les locales
const localesDir = path.join(__dirname, 'locales');
const buildLocalesDir = path.join(buildDir, 'locales');
if (fs.existsSync(localesDir)) {
    if (!fs.existsSync(buildLocalesDir)) {
        fs.mkdirSync(buildLocalesDir, { recursive: true });
    }
    
    const locales = fs.readdirSync(localesDir);
    locales.forEach(locale => {
        const sourcePath = path.join(localesDir, locale);
        const destPath = path.join(buildLocalesDir, locale);
        
        if (fs.statSync(sourcePath).isDirectory()) {
            if (!fs.existsSync(destPath)) {
                fs.mkdirSync(destPath, { recursive: true });
            }
            
            const files = fs.readdirSync(sourcePath);
            files.forEach(file => {
                const fileSource = path.join(sourcePath, file);
                const fileDest = path.join(destPath, file);
                fs.copyFileSync(fileSource, fileDest);
                console.log(`✅ locales/${locale}/${file} copié`);
            });
        }
    });
}

// Copier les images
const imagesDir = path.join(__dirname, 'assets', 'images');
const buildImagesDir = path.join(buildDir, 'assets', 'images');
if (fs.existsSync(imagesDir)) {
    if (!fs.existsSync(buildImagesDir)) {
        fs.mkdirSync(buildImagesDir, { recursive: true });
    }
    
    const copyImages = (sourceDir, destDir) => {
        const files = fs.readdirSync(sourceDir);
        files.forEach(file => {
            const sourcePath = path.join(sourceDir, file);
            const destPath = path.join(destDir, file);
            
            if (fs.statSync(sourcePath).isDirectory()) {
                if (!fs.existsSync(destPath)) {
                    fs.mkdirSync(destPath, { recursive: true });
                }
                copyImages(sourcePath, destPath);
            } else {
                fs.copyFileSync(sourcePath, destPath);
                console.log(`✅ images/${file} copié`);
            }
        });
    };
    
    copyImages(imagesDir, buildImagesDir);
}

// 4. Lire le manifest pour trouver tous les fichiers nécessaires
console.log('4. Lecture du manifest pour tous les fichiers...');
const manifestPath = path.join(buildDir, 'manifest.json');
let cssFiles = ['assets/main.css']; // CSS principal
let jsFiles = ['assets/app.js']; // JS principal

if (fs.existsSync(manifestPath)) {
    try {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        
        // Chercher tous les fichiers dans le manifest
        Object.values(manifest).forEach(entry => {
            // CSS files
            if (entry.css && Array.isArray(entry.css)) {
                entry.css.forEach(cssFile => {
                    if (!cssFiles.includes(cssFile)) {
                        cssFiles.push(cssFile);
                        console.log(`✅ CSS trouvé: ${cssFile}`);
                    }
                });
            }
            
            // JS files (seulement les fichiers .js)
            if (entry.file && entry.file.startsWith('assets/') && entry.file.endsWith('.js')) {
                if (!jsFiles.includes(entry.file)) {
                    jsFiles.push(entry.file);
                    console.log(`✅ JS trouvé: ${entry.file}`);
                }
            }
        });
    } catch (error) {
        console.log('⚠️  Erreur lecture manifest:', error.message);
    }
}

// 5. Générer index.html avec tous les fichiers nécessaires
console.log('5. Génération de index.html...');
const cssLinks = cssFiles.map(css => `    <link rel="stylesheet" href="/${css}">`).join('\n');
const jsScripts = jsFiles.map(js => `    <script type="module" src="/${js}"></script>`).join('\n');

const htmlContent = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Diama - Tracking de Vaches</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="icon" type="image/png" href="/favicon.png" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
${cssLinks}
</head>
<body>
    <div id="root"></div>
${jsScripts}
</body>
</html>`;

fs.writeFileSync(path.join(buildDir, 'index.html'), htmlContent);
console.log('✅ index.html généré');

// 6. Vérifier les fichiers principaux
console.log('6. Vérification des fichiers principaux...');
const requiredFiles = ['index.html', 'assets/app.js', ...cssFiles];
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