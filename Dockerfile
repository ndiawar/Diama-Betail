FROM heroku/php:latest

# Copier les fichiers de l'application
COPY . /app

# Définir le répertoire de travail
WORKDIR /app

# Exposer le port
EXPOSE $PORT

# Commande de démarrage
CMD php artisan serve --host 0.0.0.0 --port $PORT 