#include <TinyGPS++.h>
#include <HardwareSerial.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <time.h>

// ===== CONFIGURATION RENDER =====
// Remplacez ces valeurs par vos informations Render
const char* ssid = "VOTRE_WIFI_SSID";
const char* password = "VOTRE_WIFI_PASSWORD";

// URL du déploiement Render (à remplacer par votre URL)
const char* serverUrl = "https://diama-backend.onrender.com/api/vaches/update";

// Configuration GPS
const bool USE_FIXED_COORDINATES = true;
const float FIXED_LAT = 14.7305975;  // Dakar, Sénégal
const float FIXED_LNG = -17.321913;
const float FIXED_ALT = 7.6;

// GPS
TinyGPSPlus gps;
HardwareSerial gpsSerial(2);

// Structure optimisée pour les données de la vache
struct VacheData {
  char id_rfid[20];
  char nom[20];
  char sexe[10];
  float poids;
  char dernier_vaccin[11];
  char date_mise_bas[11];
  int nb_portees;
  float temperature;
  float production_lait;
  char statut_sante[10];
};

// Données de la vache (optimisées)
VacheData vache = {
  "04 A3 B2 1C",
  "Diama",
  "Femelle",
  430.5,
  "2024-12-15",
  "2025-04-02",
  3,
  38.5,
  25.0,
  "bonne"
};

// Variables de timing
unsigned long lastUpdate = 0;
const unsigned long updateInterval = 60000; // 1 minute
unsigned long lastWiFiCheck = 0;
const unsigned long wifiCheckInterval = 30000; // Vérifier WiFi toutes les 30 secondes

// Compteur de tentatives
int retryCount = 0;
const int maxRetries = 3;

void setup() {
  Serial.begin(9600);
  delay(1000); // Délai de stabilisation
  
  Serial.println("=== Système Collier RFID DIAMA (RENDER) ===");
  Serial.println("🌐 Configuration pour déploiement Render");
  Serial.printf("📡 URL serveur: %s\n", serverUrl);
  
  // Configuration GPS
  gpsSerial.begin(9600, SERIAL_8N1, 13, 12);
  
  // Connexion WiFi
  connectToWiFi();
  
  delay(2000); // Délai supplémentaire
}

void loop() {
  // Lecture GPS (réduite)
  if (gpsSerial.available() > 0) {
    gps.encode(gpsSerial.read());
  }

  // Vérification WiFi périodique
  if (millis() - lastWiFiCheck >= wifiCheckInterval) {
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("🔄 Reconnexion WiFi...");
      connectToWiFi();
    }
    lastWiFiCheck = millis();
  }

  // Mise à jour des données
  if (millis() - lastUpdate >= updateInterval) {
    if (gps.location.isUpdated() || USE_FIXED_COORDINATES) {
      displayLocalData();
      sendToRenderServer();
      lastUpdate = millis();
    } else {
      Serial.println("⚠️ En attente de signal GPS...");
    }
  }
  
  delay(2000); // Délai plus long pour réduire la charge
}

void connectToWiFi() {
  Serial.print("Connexion WiFi à ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  const int maxAttempts = 30; // Plus de tentatives
  
  while (WiFi.status() != WL_CONNECTED && attempts < maxAttempts) {
    delay(1000); // Délai plus long
    Serial.print(".");
    attempts++;
  }
  
  Serial.println();
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("✅ WiFi connecté !");
    Serial.print("Adresse IP: ");
    Serial.println(WiFi.localIP());
    retryCount = 0; // Reset du compteur de tentatives
  } else {
    Serial.println("❌ Échec connexion WiFi");
  }
}

void displayLocalData() {
  Serial.println("\n🔄 ===== DONNÉES GPS + VACHE (RENDER) =====");
  
  // Données GPS simplifiées
  Serial.println("📍 Position GPS:");
  if (USE_FIXED_COORDINATES) {
    Serial.printf("   Latitude: %.6f (FIXE)\n", FIXED_LAT);
    Serial.printf("   Longitude: %.6f (FIXE)\n", FIXED_LNG);
  } else {
    Serial.printf("   Latitude: %.6f\n", gps.location.lat());
    Serial.printf("   Longitude: %.6f\n", gps.location.lng());
  }
  
  // Profil animal simplifié
  Serial.println("🐄 Profil Animal:");
  Serial.printf("   ID RFID: %s\n", vache.id_rfid);
  Serial.printf("   Nom: %s\n", vache.nom);
  Serial.printf("   Température: %.1f°C\n", vache.temperature);
  Serial.printf("   Production lait: %.1f L/jour\n", vache.production_lait);
  Serial.printf("   Statut santé: %s\n", vache.statut_sante);
  
  Serial.println("=============================================\n");
}

void sendToRenderServer() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ WiFi non connecté");
    return;
  }
  
  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("User-Agent", "DIAMA-ESP32/1.0");
  
  // JSON optimisé
  DynamicJsonDocument doc(512); // Taille réduite
  
  doc["vache_id"] = vache.id_rfid;
  doc["nom"] = vache.nom;
  
  if (USE_FIXED_COORDINATES) {
    doc["position"]["lat"] = FIXED_LAT;
    doc["position"]["lng"] = FIXED_LNG;
    doc["altitude"] = FIXED_ALT;
  } else {
    doc["position"]["lat"] = gps.location.lat();
    doc["position"]["lng"] = gps.location.lng();
    doc["altitude"] = gps.altitude.meters();
  }
  
  doc["temperature"] = vache.temperature;
  doc["poids"] = vache.poids;
  doc["production_lait"] = vache.production_lait;
  doc["statut_sante"] = vache.statut_sante;
  doc["sexe"] = vache.sexe;
  doc["dernier_vaccin"] = vache.dernier_vaccin;
  doc["date_mise_bas"] = vache.date_mise_bas;
  doc["nb_portees"] = vache.nb_portees;
  doc["gps_actif"] = true; // Simuler GPS actif pour les tests
  
  // Timestamp simplifié
  char timestamp[25];
  time_t now = time(nullptr);
  struct tm* timeinfo = localtime(&now);
  sprintf(timestamp, "%04d-%02d-%02dT%02d:%02d:%02dZ",
    timeinfo->tm_year + 1900, timeinfo->tm_mon + 1, timeinfo->tm_mday,
    timeinfo->tm_hour, timeinfo->tm_min, timeinfo->tm_sec);
  doc["timestamp"] = timestamp;
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  Serial.println("📡 Envoi vers DIAMA Render...");
  Serial.printf("🌐 URL: %s\n", serverUrl);
  
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.printf("✅ Réponse Render: %d\n", httpResponseCode);
    Serial.printf("📄 Contenu: %s\n", response.c_str());
    retryCount = 0; // Reset du compteur de tentatives
  } else {
    Serial.printf("❌ Erreur HTTP: %d\n", httpResponseCode);
    retryCount++;
    
    if (retryCount >= maxRetries) {
      Serial.println("⚠️ Nombre maximum de tentatives atteint");
      retryCount = 0; // Reset pour la prochaine fois
    }
  }
  
  http.end();
} 