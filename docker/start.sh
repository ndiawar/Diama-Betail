#!/bin/bash

# Créer le fichier .env s'il n'existe pas
if [ ! -f .env ]; then
    cp env.example .env
fi

# Générer la clé d'application si elle n'existe pas
php artisan key:generate --force

# Exécuter les migrations
php artisan migrate --force

# Démarrer Apache en premier plan
apache2-foreground 