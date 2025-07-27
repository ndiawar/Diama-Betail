# 🐄 DIAMA - Système de Suivi de Vaches en Temps Réel

DIAMA est une application web moderne pour la gestion et le suivi en temps réel d'un troupeau de vaches. Elle utilise des capteurs ESP32 pour collecter des données GPS, température, poids et production de lait, puis les affiche dans une interface web moderne.

## 📋 Table des matières

- [Fonctionnalités](#-fonctionnalités)
- [Architecture](#-architecture)
- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Démarrage](#-démarrage)
- [Utilisation](#-utilisation)
- [API Endpoints](#-api-endpoints)
- [Dépannage](#-dépannage)
- [Structure du projet](#-structure-du-projet)

## ✨ Fonctionnalités

- 🐄 **Gestion du troupeau** : Suivi de toutes les vaches avec leurs informations détaillées
- 📍 **GPS en temps réel** : Localisation précise de chaque vache
- 🌡️ **Monitoring santé** : Surveillance de la température et du poids
- 🥛 **Production de lait** : Suivi de la production quotidienne
- 📊 **Tableau de bord** : Statistiques et métriques en temps réel
- 🔄 **Mises à jour automatiques** : WebSocket pour les données en temps réel
- 📱 **Interface responsive** : Compatible desktop et mobile
- 🌍 **Multi-langues** : Support de plusieurs langues

## 🏗️ Architecture

```
ESP32 (Capteurs) → Laravel API → Laravel Echo Server → Frontend React/TypeScript
```

### Composants principaux :
- **Backend** : Laravel 10 (PHP 8.1+)
- **Frontend** : React 18 + TypeScript + Vite
- **Base de données** : MySQL/PostgreSQL
- **WebSocket** : Laravel Echo Server (dev) / Pusher (prod)
- **Hardware** : ESP32 avec GPS, capteurs de température et poids

## 📋 Prérequis

### Système d'exploitation
- ✅ Linux (Ubuntu 20.04+ recommandé)
- ✅ macOS 10.15+
- ✅ Windows 10+ (avec WSL recommandé)

### Logiciels requis
- **PHP** : 8.1 ou supérieur
- **Composer** : 2.0 ou supérieur
- **Node.js** : 18.0 ou supérieur
- **npm** : 8.0 ou supérieur
- **MySQL** : 8.0 ou supérieur (ou PostgreSQL 13+)
- **Git** : 2.30 ou supérieur

### Vérification des prérequis
```bash
# Vérifier PHP
php --version  # Doit être >= 8.1

# Vérifier Composer
composer --version  # Doit être >= 2.0

# Vérifier Node.js
node --version  # Doit être >= 18.0

# Vérifier npm
npm --version  # Doit être >= 8.0

# Vérifier MySQL
mysql --version  # Doit être >= 8.0
```

## 🚀 Installation

### 1. Cloner le projet
```bash
git clone https://github.com/votre-username/Projet_Diama.git
cd Projet_Diama
```

### 2. Installer les dépendances PHP
```bash
composer install
```

### 3. Installer les dépendances Node.js
```bash
npm install
```

### 4. Installer Laravel Echo Server (pour le développement)
```bash
npm install laravel-echo-server --save-dev
```

### 5. Configurer l'environnement
```bash
# Copier le fichier d'environnement
cp .env.example .env

# Générer la clé d'application Laravel
php artisan key:generate
```

### 6. Configurer la base de données
```bash
# Créer la base de données MySQL
mysql -u root -p
CREATE DATABASE diama_db;
CREATE USER 'diama_user'@'localhost' IDENTIFIED BY 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON diama_db.* TO 'diama_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Mettre à jour le fichier .env avec vos informations de base de données
```

### 7. Exécuter les migrations
```bash
php artisan migrate
```

### 8. Seeder les données (optionnel)
```bash
php artisan db:seed
```

## ⚙️ Configuration

### Configuration de l'environnement (.env)

```env
# Configuration de base
APP_NAME="DIAMA - Suivi de Vaches"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

# Base de données
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=diama_db
DB_USERNAME=diama_user
DB_PASSWORD=votre_mot_de_passe

# Configuration Pusher (Laravel Echo Server)
PUSHER_APP_ID=56d5bf113b4443f8
PUSHER_APP_KEY=da023cbd84a0d6e8816b615aafc7e1fd
PUSHER_APP_SECRET=your-app-secret
PUSHER_HOST=127.0.0.1
PUSHER_PORT=6001
PUSHER_SCHEME=http
PUSHER_APP_CLUSTER=mt1
BROADCAST_DRIVER=pusher

# Variables pour le frontend (Vite)
VITE_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
VITE_PUSHER_HOST="${PUSHER_HOST}"
VITE_PUSHER_PORT="${PUSHER_PORT}"
VITE_PUSHER_SCHEME="${PUSHER_SCHEME}"
VITE_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
```

### Configuration Laravel Echo Server

Le fichier `laravel-echo-server.json` est automatiquement généré lors de l'installation :

```json
{
  "authHost": "http://localhost",
  "authEndpoint": "/broadcasting/auth",
  "clients": [
    {
      "appId": "56d5bf113b4443f8",
      "key": "da023cbd84a0d6e8816b615aafc7e1fd"
    }
  ],
  "database": "sqlite",
  "databaseConfig": {
    "sqlite": {
      "databasePath": "/database/laravel-echo-server.sqlite"
    }
  },
  "devMode": true,
  "host": null,
  "port": "6001",
  "protocol": "http",
  "subscribers": {
    "http": true,
    "redis": false
  }
}
```

## 🚀 Démarrage

### 1. Démarrer Laravel Echo Server (Terminal 1)
```bash
npx laravel-echo-server start
```
**Résultat attendu :**
```
L A R A V E L  E C H O  S E R V E R
version 1.6.3
⚠ Starting server in DEV mode...
✔  Running at localhost on port 6001
✔  Channels are ready.
✔  Listening for http events...
Server ready!
```

### 2. Démarrer le serveur Laravel (Terminal 2)
```bash
php artisan serve --host=0.0.0.0 --port=8000
```
**Résultat attendu :**
```
INFO  Server running on [http://0.0.0.0:8000].
Press Ctrl+C to stop the server
```

### 3. Démarrer le serveur de développement frontend (Terminal 3)
```bash
npm run dev
```
**Résultat attendu :**
```
VITE v4.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 4. Vérifier que tout fonctionne
```bash
# Test de l'API Laravel
curl http://localhost:8000/api/vaches

# Test de Laravel Echo Server
curl http://127.0.0.1:6001
# Doit retourner "OK"
```

## 📱 Utilisation

### Accès à l'application
1. Ouvrez votre navigateur
2. Allez sur `http://localhost:5173`
3. Vous devriez voir l'interface DIAMA

### Interface utilisateur
- **Dashboard** : Vue d'ensemble du troupeau
- **Vaches** : Liste détaillée de toutes les vaches
- **Carte** : Localisation GPS en temps réel
- **Statistiques** : Métriques et analyses

### Fonctionnalités principales
1. **Visualisation des vaches** : Tableau avec tri et recherche
2. **Suivi GPS** : Carte interactive avec positions
3. **Mises à jour temps réel** : Données automatiquement actualisées
4. **Statistiques** : Graphiques et métriques

## 🔌 API Endpoints

### Endpoints principaux

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/vaches` | Récupérer toutes les vaches |
| GET | `/api/vaches/{id}` | Récupérer une vache spécifique |
| POST | `/api/vaches/update` | Mettre à jour les données d'une vache |
| GET | `/api/vaches/stats` | Statistiques du troupeau |

### Exemple d'utilisation API

```bash
# Récupérer toutes les vaches
curl http://localhost:8000/api/vaches

# Mettre à jour une vache (format ESP32)
curl -X POST http://localhost:8000/api/vaches/update \
  -H "Content-Type: application/json" \
  -d '{
    "vache_id": "04 A3 B2 1C",
    "nom": "Diama",
    "position": {"lat": 14.7306, "lng": -17.32191},
    "temperature": 38.5,
    "poids": 430.5,
    "production_lait": 25,
    "statut_sante": "bonne"
  }'
```

## 🔧 Dépannage

### Problèmes courants

#### 1. Erreur "auth_key should be a valid app key"
**Solution :**
```bash
# Vider le cache de configuration
php artisan config:clear
php artisan cache:clear

# Redémarrer les services
```

#### 2. Laravel Echo Server ne démarre pas
**Solution :**
```bash
# Vérifier que le port 6001 est libre
sudo lsof -i :6001

# Redémarrer Laravel Echo Server
npx laravel-echo-server start
```

#### 3. Erreurs de base de données
**Solution :**
```bash
# Vérifier la configuration .env
# Exécuter les migrations
php artisan migrate:fresh

# Vérifier la connexion
php artisan tinker
DB::connection()->getPdo();
```

#### 4. Frontend ne se connecte pas au WebSocket
**Solution :**
```javascript
// Dans la console du navigateur
console.log(websocketService.pusher.connection.state);
// Doit retourner "connected"
```

### Logs utiles

```bash
# Logs Laravel
tail -f storage/logs/laravel.log

# Logs Laravel Echo Server
# Affichés directement dans le terminal

# Logs du serveur Laravel
# Affichés directement dans le terminal
```

## 📁 Structure du projet

```
Projet_Diama/
├── app/
│   ├── Http/Controllers/
│   │   ├── VacheController.php      # API vaches
│   │   └── AppController.php        # Contrôleur principal
│   ├── Models/
│   │   ├── Vache.php               # Modèle vache
│   │   ├── VachePosition.php       # Positions GPS
│   │   ├── VacheTemperature.php    # Températures
│   │   └── VacheProductionLait.php # Production lait
│   └── Events/
│       └── VacheUpdated.php        # Événement broadcast
├── resources/js/src/
│   ├── pages/
│   │   ├── Vaches.tsx              # Page liste vaches
│   │   ├── Carte.tsx               # Page carte GPS
│   │   └── Index.tsx               # Dashboard
│   ├── services/
│   │   ├── api.ts                  # Service API
│   │   └── websocket.ts            # Service WebSocket
│   └── components/                 # Composants React
├── database/migrations/            # Migrations base de données
├── routes/api.php                  # Routes API
├── .env                            # Configuration environnement
├── laravel-echo-server.json        # Configuration WebSocket
└── README.md                       # Ce fichier
```

## 🛠️ Développement

### Scripts npm disponibles
```bash
# Développement
npm run dev          # Démarrer le serveur de développement
npm run build        # Build pour production
npm run preview      # Prévisualiser le build

# Tests
npm run test         # Exécuter les tests
npm run test:watch   # Tests en mode watch
```

### Scripts artisan disponibles
```bash
# Base de données
php artisan migrate              # Exécuter les migrations
php artisan migrate:fresh        # Réinitialiser la base
php artisan db:seed              # Seeder les données

# Cache
php artisan config:clear         # Vider le cache config
php artisan cache:clear          # Vider le cache
php artisan route:clear          # Vider le cache routes

# Développement
php artisan serve                # Démarrer le serveur
php artisan tinker               # Console interactive
```

## 🚀 Déploiement en production

### 1. Configuration production
```env
APP_ENV=production
APP_DEBUG=false
BROADCAST_DRIVER=pusher  # Ou redis
```

### 2. Build frontend
```bash
npm run build
```

### 3. Optimisation Laravel
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 4. Serveur web
- **Nginx** ou **Apache** pour servir l'application
- **Supervisor** pour gérer les processus
- **Redis** pour les sessions et cache

## 📞 Support

Pour toute question ou problème :
- 📧 Email : support@diama.com
- 🐛 Issues : GitHub Issues
- 📖 Documentation : Wiki du projet

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

**DIAMA** - Suivi intelligent de votre troupeau 🐄✨
