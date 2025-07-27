#include <TinyGPS++.h>
#include <HardwareSerial.h>

// GPS
TinyGPSPlus gps;
HardwareSerial gpsSerial(2); // UART2 (GPIO 13 RX, GPIO 12 TX)

void setup() {
  Serial.begin(115200);
  gpsSerial.begin(9600, SERIAL_8N1, 13, 12); // GPS: RX=13, TX=12

  Serial.println("=== Test GPS ESP32 ===");
  Serial.println("Attente de données GPS...");
  Serial.println("Vérifiez :");
  Serial.println("1. GPS branché sur GPIO 13 (RX) et GPIO 12 (TX)");
  Serial.println("2. Antenne GPS connectée");
  Serial.println("3. GPS en extérieur avec vue ciel");
  Serial.println("4. Première acquisition peut prendre 5-15 minutes");
  Serial.println("========================");
}

void loop() {
  // Lecture des données brutes du GPS
  while (gpsSerial.available() > 0) {
    char c = gpsSerial.read();
    Serial.print(c); // Afficher les données brutes
    
    // Décodage avec TinyGPS++
    gps.encode(c);
  }

  // Affichage des informations GPS
  if (millis() > 5000 && gps.charsProcessed() < 10) {
    Serial.println("❌ Aucune donnée GPS reçue !");
    Serial.println("Vérifiez la connexion série.");
    Serial.println("GPIO 13 (RX) ← TX du GPS");
    Serial.println("GPIO 12 (TX) → RX du GPS");
    return;
  }

  // Affichage des données décodées
  if (gps.location.isUpdated()) {
    Serial.println("\n✅ GPS FONCTIONNEL !");
    Serial.printf("Latitude: %.6f\n", gps.location.lat());
    Serial.printf("Longitude: %.6f\n", gps.location.lng());
    Serial.printf("Altitude: %.1f m\n", gps.altitude.meters());
    Serial.printf("Satellites: %d\n", gps.satellites.value());
    Serial.printf("Précision: %.1f m\n", gps.hdop.value());
    Serial.printf("Date: %02d/%02d/%04d\n", 
      gps.date.day(), gps.date.month(), gps.date.year());
    Serial.printf("Heure: %02d:%02d:%02d\n", 
      gps.time.hour(), gps.time.minute(), gps.time.second());
    Serial.println("========================");
  }

  // Affichage du statut toutes les 10 secondes
  static unsigned long lastStatus = 0;
  if (millis() - lastStatus > 10000) {
    Serial.printf("\n📡 Statut GPS: %d caractères reçus, %d phrases valides\n", 
      gps.charsProcessed(), gps.sentencesWithFix());
    Serial.printf("🛰️ Satellites: %d\n", gps.satellites.value());
    Serial.printf("📍 Fix: %s\n", gps.location.isValid() ? "OUI" : "NON");
    Serial.println("========================");
    lastStatus = millis();
  }

  delay(100);
} 