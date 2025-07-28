import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Copie des favicons...');

// Chemins des fichiers
const buildDir = path.join(__dirname, 'build');
const faviconFiles = ['favicon.svg', 'favicon.png', 'favicon.ico'];

// Vérifier que le dossier build existe
if (!fs.existsSync(buildDir)) {
    console.error('Dossier build non trouvé !');
    process.exit(1);
}

// Copier chaque favicon
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

console.log('Copie des favicons terminée !'); 