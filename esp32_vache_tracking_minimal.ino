#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// Configuration WiFi
const char* ssid = "Sanco";
const char* password = "scopsSanco;79Pi/";

// Configuration serveur
const char* serverUrl = "http://192.168.1.17:8000/api/vaches/update";

// Variables de timing
unsigned long lastUpdate = 0;
const unsigned long updateInterval = 60000; // 1 minute

void setup() {
  Serial.begin(9600);
  delay(2000);
  
  Serial.println("=== DIAMA MINIMAL START ===");
  
  // Connexion WiFi
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(1000);
    Serial.print(".");
    attempts++;
  }
  
  Serial.println();
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("WiFi OK");
  } else {
    Serial.println("WiFi FAIL");
  }
  
  delay(1000);
}

void loop() {
  // Vérification WiFi
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi reconnect...");
    WiFi.begin(ssid, password);
    delay(5000);
    return;
  }

  // Envoi toutes les minutes
  if (millis() - lastUpdate >= updateInterval) {
    sendData();
    lastUpdate = millis();
  }
  
  delay(5000); // Délai long
}

void sendData() {
  Serial.println("Sending data...");
  
  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  
  // JSON minimal
  DynamicJsonDocument doc(256);
  doc["vache_id"] = "04 A3 B2 1C";
  doc["nom"] = "Diama";
  doc["position"]["lat"] = 14.7306;
  doc["position"]["lng"] = -17.3219;
  doc["temperature"] = 38.5;
  doc["poids"] = 430.5;
  doc["production_lait"] = 25.0;
  doc["statut_sante"] = "bonne";
  doc["sexe"] = "Femelle";
  doc["dernier_vaccin"] = "2024-12-15";
  doc["date_mise_bas"] = "2025-04-02";
  doc["nb_portees"] = 3;
  doc["gps_actif"] = false;
  doc["timestamp"] = "2025-07-27T04:00:00Z";
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode > 0) {
    Serial.printf("HTTP OK: %d\n", httpResponseCode);
  } else {
    Serial.printf("HTTP ERROR: %d\n", httpResponseCode);
  }
  
  http.end();
} 