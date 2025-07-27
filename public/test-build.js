import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=== Test du build ===');

// Chemins des fichiers
const buildDir = path.join(__dirname, 'build');
const assetsDir = path.join(__dirname, 'build', 'assets');
const indexPath = path.join(__dirname, 'build', 'index.html');

// Vérifier que les dossiers existent
console.log('1. Vérification des dossiers...');
if (!fs.existsSync(buildDir)) {
    console.error('❌ Dossier build non trouvé !');
    process.exit(1);
}
console.log('✅ Dossier build trouvé');

if (!fs.existsSync(assetsDir)) {
    console.error('❌ Dossier assets non trouvé !');
    process.exit(1);
}
console.log('✅ Dossier assets trouvé');

// Lister les fichiers
console.log('\n2. Fichiers dans assets:');
const files = fs.readdirSync(assetsDir);
files.forEach(file => console.log(`  - ${file}`));

// Vérifier les fichiers principaux
console.log('\n3. Vérification des fichiers principaux...');
const appJsPath = path.join(assetsDir, 'app.js');
const mainCssPath = path.join(assetsDir, 'main.css');
const indexPathExists = fs.existsSync(indexPath);

if (!fs.existsSync(appJsPath)) {
    console.error('❌ Fichier app.js non trouvé !');
} else {
    console.log('✅ Fichier app.js trouvé');
}

if (!fs.existsSync(mainCssPath)) {
    console.error('❌ Fichier main.css non trouvé !');
} else {
    console.log('✅ Fichier main.css trouvé');
}

if (!indexPathExists) {
    console.error('❌ Fichier index.html non trouvé !');
} else {
    console.log('✅ Fichier index.html trouvé');
}

// Vérifier le contenu de index.html
console.log('\n4. Contenu de index.html:');
if (indexPathExists) {
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    console.log(indexContent);
    
    // Vérifier les références
    const hasAppJs = indexContent.includes('app.js');
    const hasMainCss = indexContent.includes('main.css');
    
    console.log('\n5. Vérification des références:');
    console.log(`  - Référence à app.js: ${hasAppJs ? '✅' : '❌'}`);
    console.log(`  - Référence à main.css: ${hasMainCss ? '✅' : '❌'}`);
}

// Vérifier les fichiers de configuration
console.log('\n6. Fichiers de configuration:');
const htaccessPath = path.join(__dirname, 'build', '.htaccess');
const headersPath = path.join(__dirname, 'build', '_headers');

console.log(`  - .htaccess: ${fs.existsSync(htaccessPath) ? '✅' : '❌'}`);
console.log(`  - _headers: ${fs.existsSync(headersPath) ? '✅' : '❌'}`);

console.log('\n=== Test terminé ==='); 