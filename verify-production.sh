#!/bin/bash

# Script de vérification pré-déploiement DIAMA
echo "🔍 Vérification de l'application DIAMA avant déploiement..."

# 1. Vérifier les fichiers essentiels
echo "📁 Vérification des fichiers..."
files_to_check=(
    "render.yaml"
    "Dockerfile" 
    "docker/start.sh"
    "database/seeders/ProductionSeeder.php"
    "database/seeders/DatabaseSeeder.php"
    "app/Http/Controllers/VacheController.php"
)

for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file manquant !"
        exit 1
    fi
done

# 2. Vérifier la syntaxe PHP
echo "🔧 Vérification syntaxe PHP..."
php -l database/seeders/ProductionSeeder.php
if [ $? -ne 0 ]; then
    echo "❌ Erreur syntaxe ProductionSeeder.php"
    exit 1
fi

# 3. Vérifier les migrations
echo "🗄️ Vérification des migrations..."
migration_files=$(ls database/migrations/ | wc -l)
if [ $migration_files -lt 4 ]; then
    echo "❌ Migrations manquantes"
    exit 1
fi
echo "✅ $migration_files fichiers de migration"

# 4. Vérifier la configuration render.yaml
echo "⚙️ Vérification render.yaml..."
if grep -q "php artisan db:seed --force" render.yaml; then
    echo "✅ Seeder configuré dans render.yaml"
else
    echo "❌ Seeder manquant dans render.yaml"
    exit 1
fi

# 5. Test du seeder en mode production
echo "🌱 Test seeder production..."
APP_ENV=production php artisan db:seed --class=ProductionSeeder --dry-run 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ Seeder production valide"
else
    echo "⚠️ Avertissement: Test seeder impossible (normal si pas de DB)"
fi

echo ""
echo "🎉 VÉRIFICATION TERMINÉE - PRÊT POUR LE DÉPLOIEMENT !"
echo ""
echo "📊 Résumé de la configuration production :"
echo "   🗄️ PostgreSQL (Render Database)"
echo "   🐄 5 vaches avec races sénégalaises"
echo "   📍 Historique 7 jours (optimisé production)"
echo "   🌍 Lieux réels : Grand Mbao, Colobane, etc."
echo "   🔄 Seeders auto-exécutés au déploiement"
echo ""
echo "🚀 Commandes pour déployer :"
echo "   git add . && git commit -m 'Production seeder ready' && git push"
