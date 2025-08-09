#!/bin/bash

# Créer le fichier .env s'il n'existe pas
if [ ! -f .env ]; then
    cp env.example .env
fi

# S'assurer que APP_KEY est défini
if ! grep -q "APP_KEY=base64:" .env; then
    # Générer une nouvelle clé d'application
    php artisan key:generate --force
else
    echo "APP_KEY already exists in .env"
fi

# Exécuter les migrations
php artisan migrate --force

# Exécuter les seeders en production (une seule fois)
php artisan db:seed --force

# Optimiser pour la production
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Démarrer Apache en premier plan
apache2-foreground 