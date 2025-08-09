# 🚀 Guide de déploiement DIAMA sur Render

## 📋 Prérequis

- Compte Render.com
- Repository Git (GitHub, GitLab, etc.)
- Application Laravel configurée

## 🔧 Configuration Render

### 1. Créer un nouveau service sur Render

1. **Connectez-vous à Render.com**
2. **Cliquez sur "New +"**
3. **Sélectionnez "Blueprint"**
4. **Connectez votre repository Git**

### 2. Configuration automatique

Le fichier `render.yaml` configure automatiquement :

- **Base de données PostgreSQL**
- **Service backend Laravel**
- **Service frontend statique**

## 📁 Fichiers de configuration

### `render.yaml`

```yaml
databases:
  - name: diama-db
    databaseName: diama
    user: diama
    plan: free

services:
  - type: web
    name: diama-backend
    env: php
    plan: free
    buildCommand: |
      composer install --no-dev --optimize-autoloader
      php artisan key:generate
      php artisan config:cache
      php artisan route:cache
      php artisan view:cache
    startCommand: |
      php artisan migrate --force
      php artisan serve --host 0.0.0.0 --port $PORT
```

### `.render-buildpacks`

```
heroku/php
heroku/nodejs
```

### `extensions.txt`

```
pdo_pgsql
pgsql
```

## 🔄 Étapes de déploiement

### 1. Préparer le repository

```bash
# Assurez-vous que tous les fichiers sont commités
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 2. Créer le service sur Render

1. **Allez sur Render.com**
2. **Cliquez sur "New +" → "Blueprint"**
3. **Connectez votre repository**
4. **Render détectera automatiquement le `render.yaml`**

### 3. Configuration des variables d'environnement

Render configurera automatiquement :

- **DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD** (depuis la base de données)
- **APP_KEY** (généré automatiquement)
- **APP_URL** (URL du service)

### 4. Variables d'environnement manuelles

Si nécessaire, ajoutez dans Render Dashboard :

```env
APP_ENV=production
APP_DEBUG=false
BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120
```

## 🌐 URLs générées

Après le déploiement, vous aurez :

- **Backend API** : `https://diama-backend.onrender.com`
- **Frontend** : `https://diama-frontend.onrender.com`
- **Base de données** : PostgreSQL gérée par Render

## 🔧 Configuration frontend

Le frontend sera automatiquement configuré avec :

- **VITE_API_URL** : URL du backend
- **VITE_PUSHER_*** : Configuration WebSocket

## 📊 Monitoring

### Logs

- **Backend logs** : Dashboard Render → diama-backend → Logs
- **Frontend logs** : Dashboard Render → diama-frontend → Logs

### Métriques

- **Performance** : Dashboard Render → Métriques
- **Base de données** : Dashboard Render → diama-db → Métriques

## 🔄 Mises à jour

### Déploiement automatique

- Chaque push sur `main` déclenche un nouveau déploiement
- Render détecte automatiquement les changements

### Déploiement manuel

1. **Dashboard Render** → Service → "Manual Deploy"
2. **Sélectionnez la branche** → "Deploy"

## 🛠️ Dépannage

### Erreurs courantes

#### 1. Build échoue

```bash
# Vérifiez les logs de build
# Assurez-vous que composer.json est correct
# Vérifiez les extensions PHP
```

#### 2. Migration échoue

```bash
# Vérifiez la connexion à la base de données
# Assurez-vous que les migrations sont à jour
```

#### 3. Frontend ne charge pas

```bash
# Vérifiez VITE_API_URL
# Assurez-vous que le backend fonctionne
```

### Commandes utiles

```bash
# Voir les logs en temps réel
render logs --service diama-backend

# Redémarrer un service
render restart --service diama-backend

# Voir les variables d'environnement
render env --service diama-backend
```

## 🔒 Sécurité

### Variables sensibles

- **Ne jamais commiter** `.env` ou `env.render.example`
- **Utiliser les variables d'environnement Render**
- **Changer les clés par défaut** en production

### SSL/HTTPS

- **Automatiquement configuré** par Render
- **Certificats gérés** par Render

## 📈 Optimisations

### Performance

```bash
# Cache Laravel
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Optimiser Composer
composer install --optimize-autoloader --no-dev
```

### Base de données

- **Index** sur les colonnes fréquemment utilisées
- **Requêtes optimisées** dans les contrôleurs
- **Pagination** pour les grandes listes

## 🎯 Fonctionnalités déployées

✅ **Liste des vaches** avec dates intelligentes
✅ **CRUD complet** (Créer, Lire, Modifier, Supprimer)
✅ **Carte GPS** interactive
✅ **Interface moderne** avec badges colorés
✅ **Menu d'actions** (trois points)
✅ **Temps réel** (WebSocket)
✅ **Responsive design**

## 🚀 Lancement

1. **Connectez votre repository** à Render
2. **Cliquez sur "Create Blueprint Instance"**
3. **Attendez le déploiement** (5-10 minutes)
4. **Accédez à votre application** via les URLs générées

**Votre application DIAMA sera en ligne !** 🐄✨
