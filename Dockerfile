FROM heroku/php:latest

# Copier les fichiers de l'application
COPY . /app

# Définir le répertoire de travail
WORKDIR /app

# Exposer le port
EXPOSE $PORT

# Script de démarrage qui inclut la migration
CMD php artisan migrate --force && php artisan serve --host 0.0.0.0 --port $PORT 