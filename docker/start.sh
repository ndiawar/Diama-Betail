#!/bin/bash

# Exécuter les migrations
php artisan migrate --force

# Démarrer Apache en premier plan
apache2-foreground 