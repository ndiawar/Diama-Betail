# 🔧 Configuration ESP32 pour DIAMA Render

## 📋 Paramètres à modifier

### 1. Configuration WiFi
```cpp
// Remplacez par vos informations WiFi
const char* ssid = "VOTRE_WIFI_SSID";
const char* password = "VOTRE_WIFI_PASSWORD";
```

### 2. URL du serveur Render
```cpp
// Remplacez par votre URL Render après déploiement
const char* serverUrl = "https://diama-backend.onrender.com/api/vaches/update";
```

### 3. Configuration GPS
```cpp
// Coordonnées fixes (Dakar, Sénégal par défaut)
const float FIXED_LAT = 14.7305975;
const float FIXED_LNG = -17.321913;
const float FIXED_ALT = 7.6;
```

### 4. Données de la vache
```cpp
VacheData vache = {
  "04 A3 B2 1C",    // ID RFID
  "Diama",           // Nom de la vache
  "Femelle",         // Sexe
  430.5,             // Poids en kg
  "2024-12-15",      // Dernier vaccin
  "2025-04-02",      // Date mise bas
  3,                 // Nombre de portées
  38.5,              // Température
  25.0,              // Production lait
  "bonne"            // Statut santé
};
```

## 🚀 Étapes de configuration

### 1. Déployer sur Render
1. **Suivez le guide** `DEPLOY_RENDER.md`
2. **Notez l'URL** du backend (ex: `https://diama-backend.onrender.com`)

### 2. Modifier le code ESP32
1. **Ouvrez** `esp32_vache_tracking_render.ino`
2. **Remplacez** les paramètres ci-dessus
3. **Uploadez** vers votre ESP32

### 3. Tester la connexion
1. **Ouvrez le moniteur série** (9600 bauds)
2. **Vérifiez** les messages de connexion
3. **Confirmez** l'envoi des données

## 📡 Format des données envoyées

```json
{
  "vache_id": "04 A3 B2 1C",
  "nom": "Diama",
  "position": {
    "lat": 14.7305975,
    "lng": -17.321913
  },
  "altitude": 7.6,
  "temperature": 38.5,
  "poids": 430.5,
  "production_lait": 25.0,
  "statut_sante": "bonne",
  "sexe": "Femelle",
  "dernier_vaccin": "2024-12-15",
  "date_mise_bas": "2025-04-02",
  "nb_portees": 3,
  "gps_actif": true,
  "timestamp": "2025-07-27T20:30:00Z"
}
```

## 🔍 Dépannage

### Problèmes courants

#### 1. Connexion WiFi échoue
```cpp
// Vérifiez vos paramètres WiFi
const char* ssid = "VOTRE_WIFI_SSID";
const char* password = "VOTRE_WIFI_PASSWORD";
```

#### 2. Erreur HTTP
```cpp
// Vérifiez l'URL du serveur
const char* serverUrl = "https://votre-backend.onrender.com/api/vaches/update";
```

#### 3. Données GPS incorrectes
```cpp
// Utilisez des coordonnées fixes pour les tests
const bool USE_FIXED_COORDINATES = true;
```

## 📊 Monitoring

### Logs série
```
=== Système Collier RFID DIAMA (RENDER) ===
🌐 Configuration pour déploiement Render
📡 URL serveur: https://diama-backend.onrender.com/api/vaches/update
✅ WiFi connecté !
📡 Envoi vers DIAMA Render...
✅ Réponse Render: 200
```

### Vérification sur Render
1. **Dashboard Render** → diama-backend → Logs
2. **Vérifiez** les requêtes entrantes
3. **Testez** l'API directement

## 🔄 Mise à jour automatique

Le système envoie les données :
- **Toutes les 60 secondes** (configurable)
- **Avec retry automatique** (3 tentatives)
- **Reconnexion WiFi** automatique

## 🎯 Résultat attendu

Après configuration, vous devriez voir :
1. **Connexion WiFi** réussie
2. **Envoi des données** vers Render
3. **Réponse 200** du serveur
4. **Données visibles** dans l'interface web

**Votre ESP32 enverra maintenant directement les données au déploiement Render !** 🐄📡 