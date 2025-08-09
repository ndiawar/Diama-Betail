#!/bin/bash

# Script de déploiement DIAMA avec seeders automatiques
echo "🚀 Déploiement DIAMA - Backend Laravel avec données historiques"

# Mise à jour des dépendances
echo "📦 Installation des dépendances Composer..."
composer install --no-dev --optimize-autoloader

# Cache des configurations
echo "⚡ Optimisation Laravel..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Migrations de base de données
echo "🗄️ Migration de la base de données..."
php artisan migrate --force

# Seeders avec données historiques
echo "🌱 Seeding des données historiques du Sénégal..."
php artisan db:seed --force

echo "✅ Déploiement backend terminé avec succès !"
echo "📍 Données historiques des positions créées pour les lieux :"
echo "   - Grand Mbao, Colobane, Sacré Coeur 3"
echo "   - Cité Keur Gorgui, VDN Dakar, Liberté 6, Ouakam"
echo "🐄 7 vaches avec historique de 30 jours disponibles"
