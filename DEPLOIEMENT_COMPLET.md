# 🚀 Guide de déploiement complet DIAMA

## 📋 Vue d'ensemble

Ce guide vous accompagne pour :

1. **Déployer l'application** sur Render
2. **Configurer l'ESP32** pour envoyer les données
3. **Tester le système** complet

## 🌐 Étape 1 : Déploiement sur Render

### 1.1 Préparer le repository

```bash
# Commiter tous les changements
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 1.2 Créer le service sur Render

1. **Allez sur** <https://render.com>
2. **Cliquez sur "New +"** → **"Blueprint"**
3. **Connectez votre repository** Git
4. **Render détectera** automatiquement `render.yaml`

### 1.3 Attendre le déploiement

- **Temps estimé** : 5-10 minutes
- **URLs générées** :
  - Backend : `https://diama-backend.onrender.com`
  - Frontend : `https://diama-frontend.onrender.com`

## 🔧 Étape 2 : Configuration ESP32

### 2.1 Modifier le code ESP32

Ouvrez `esp32_vache_tracking_render.ino` et modifiez :

```cpp
// Configuration WiFi
const char* ssid = "VOTRE_WIFI_SSID";
const char* password = "VOTRE_WIFI_PASSWORD";

// URL du serveur Render (remplacez par votre URL)
const char* serverUrl = "https://diama-backend.onrender.com/api/vaches/update";
```

### 2.2 Uploadez vers l'ESP32

1. **Ouvrez Arduino IDE**
2. **Chargez** `esp32_vache_tracking_render.ino`
3. **Sélectionnez** votre ESP32
4. **Uploadez** le code

### 2.3 Testez la connexion

1. **Ouvrez le moniteur série** (9600 bauds)
2. **Vérifiez** les messages :

   ```
   === Système Collier RFID DIAMA (RENDER) ===
   ✅ WiFi connecté !
   📡 Envoi vers DIAMA Render...
   ✅ Réponse Render: 200
   ```

## 🧪 Étape 3 : Tests et validation

### 3.1 Test de l'API (optionnel)

```bash
# Installer les dépendances Python
pip install requests

# Tester l'API
python3 test_api_render.py
```

### 3.2 Vérification sur Render

1. **Dashboard Render** → diama-backend → Logs
2. **Vérifiez** les requêtes entrantes
3. **Testez** l'interface web

### 3.3 Test de l'interface

1. **Allez sur** `https://diama-frontend.onrender.com`
2. **Vérifiez** que les données apparaissent
3. **Testez** les fonctionnalités CRUD

## 📊 Monitoring et maintenance

### Logs ESP32

```
📡 Envoi vers DIAMA Render...
✅ Réponse Render: 200
📄 Contenu: {"success":true,"message":"Données reçues"}
```

### Logs Render

- **Backend logs** : Dashboard Render → diama-backend → Logs
- **Frontend logs** : Dashboard Render → diama-frontend → Logs

### Métriques

- **Performance** : Dashboard Render → Métriques
- **Base de données** : Dashboard Render → diama-db → Métriques

## 🔄 Mises à jour

### Déploiement automatique

- **Chaque push** sur `main` déclenche un nouveau déploiement
- **Render détecte** automatiquement les changements

### Mise à jour ESP32

1. **Modifiez** le code si nécessaire
2. **Uploadez** vers l'ESP32
3. **Vérifiez** les logs série

## 🛠️ Dépannage

### Problèmes courants

#### 1. ESP32 ne se connecte pas au WiFi

```cpp
// Vérifiez vos paramètres WiFi
const char* ssid = "VOTRE_WIFI_SSID";
const char* password = "VOTRE_WIFI_PASSWORD";
```

#### 2. Erreur HTTP de l'ESP32

```cpp
// Vérifiez l'URL du serveur
const char* serverUrl = "https://votre-backend.onrender.com/api/vaches/update";
```

#### 3. Déploiement Render échoue

- **Vérifiez** les logs de build
- **Assurez-vous** que `render.yaml` est correct
- **Vérifiez** les variables d'environnement

#### 4. Données ne s'affichent pas

- **Vérifiez** les logs Render
- **Testez** l'API directement
- **Vérifiez** la base de données

## 🎯 Résultat final

Après configuration, vous aurez :

### ✅ Système complet

- **ESP32** envoie les données toutes les 60 secondes
- **Render** traite et stocke les données
- **Interface web** affiche les données en temps réel
- **Carte GPS** montre les positions
- **CRUD complet** pour gérer les vaches

### ✅ URLs d'accès

- **Frontend** : `https://diama-frontend.onrender.com`
- **Backend API** : `https://diama-backend.onrender.com`
- **Base de données** : PostgreSQL gérée par Render

### ✅ Fonctionnalités

- **Liste des vaches** avec dates intelligentes
- **Ajout/Modification/Suppression** des vaches
- **Carte GPS** interactive
- **Interface moderne** avec badges colorés
- **Menu d'actions** (trois points)
- **Temps réel** via WebSocket

## 🚀 Lancement rapide

### Option 1 : Script automatisé

```bash
./deploy.sh
```

### Option 2 : Manuel

```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

Puis allez sur **<https://render.com>** et créez un nouveau **Blueprint** !

**Votre système DIAMA complet sera opérationnel !** 🐄📡✨
