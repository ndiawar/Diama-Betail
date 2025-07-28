import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=== Configuration complète du build ===');

// Chemins des fichiers
const buildDir = path.join(__dirname, 'build');

// Vérifier que le dossier build existe
if (!fs.existsSync(buildDir)) {
    console.error('❌ Dossier build non trouvé !');
    process.exit(1);
}

console.log('✅ Dossier build trouvé');

// 1. Copier les favicons
console.log('\n1. Copie des favicons...');
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

// 2. Créer le fichier _redirects
console.log('\n2. Création du fichier _redirects...');
const redirectsContent = '/*    /index.html   200';
fs.writeFileSync(path.join(buildDir, '_redirects'), redirectsContent);
console.log('✅ _redirects créé');

// 3. Créer le fichier _headers
console.log('\n3. Création du fichier _headers...');
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

// 4. Créer le fichier .htaccess
console.log('\n4. Création du fichier .htaccess...');
const htaccessContent = `# Forcer les types MIME corrects
<FilesMatch "\\.css$">
    Header set Content-Type "text/css"
</FilesMatch>

<FilesMatch "\\.js$">
    Header set Content-Type "application/javascript"
</FilesMatch>

<FilesMatch "\\.json$">
    Header set Content-Type "application/json"
</FilesMatch>

# Redirection pour les routes SPA
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [L]`;
fs.writeFileSync(path.join(buildDir, '.htaccess'), htaccessContent);
console.log('✅ .htaccess créé');

// 5. Vérifier les fichiers principaux
console.log('\n5. Vérification des fichiers principaux...');
const requiredFiles = ['index.html', 'assets/app.js', 'assets/main.css'];
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
    console.log('\n🎉 Configuration du build terminée avec succès !');
} else {
    console.log('\n⚠️  Certains fichiers sont manquants');
    process.exit(1);
} 