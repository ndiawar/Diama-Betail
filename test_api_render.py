#!/usr/bin/env python3
"""
🐄 Test API DIAMA Render
Script pour tester l'endpoint /api/vaches/update avant déploiement ESP32
"""

import requests
import json
import time
from datetime import datetime

# Configuration
RENDER_URL = "https://diama-backend.onrender.com/api/vaches/update"
TEST_INTERVAL = 60  # secondes

# Données de test (similaires à l'ESP32)
test_data = {
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
    "gps_actif": True,
    "timestamp": datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ")
}

def test_api_connection():
    """Teste la connexion à l'API Render"""
    print("🔍 Test de connexion à l'API Render...")
    print(f"🌐 URL: {RENDER_URL}")
    
    try:
        # Test de connexion simple
        response = requests.get(RENDER_URL.replace("/update", ""), timeout=10)
        print(f"✅ Connexion réussie: {response.status_code}")
        return True
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur de connexion: {e}")
        return False

def send_test_data():
    """Envoie des données de test à l'API"""
    print("\n📡 Envoi de données de test...")
    print(f"📊 Données: {json.dumps(test_data, indent=2)}")
    
    headers = {
        "Content-Type": "application/json",
        "User-Agent": "DIAMA-Test/1.0"
    }
    
    try:
        response = requests.post(RENDER_URL, json=test_data, headers=headers, timeout=10)
        
        print(f"📡 Statut: {response.status_code}")
        print(f"📄 Réponse: {response.text}")
        
        if response.status_code == 200:
            print("✅ Données envoyées avec succès!")
            return True
        else:
            print(f"❌ Erreur: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur de requête: {e}")
        return False

def simulate_esp32():
    """Simule le comportement de l'ESP32"""
    print("\n🤖 Simulation ESP32...")
    print("📡 Envoi de données toutes les 60 secondes")
    print("⏹️  Appuyez sur Ctrl+C pour arrêter")
    
    count = 0
    
    try:
        while True:
            count += 1
            print(f"\n🔄 Envoi #{count} - {datetime.now().strftime('%H:%M:%S')}")
            
            # Mettre à jour le timestamp
            test_data["timestamp"] = datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ")
            
            # Simuler des variations de température
            import random
            test_data["temperature"] = round(38.0 + random.uniform(-0.5, 0.5), 1)
            
            success = send_test_data()
            
            if success:
                print("✅ Données reçues par Render")
            else:
                print("❌ Échec de l'envoi")
            
            print(f"⏳ Attente de {TEST_INTERVAL} secondes...")
            time.sleep(TEST_INTERVAL)
            
    except KeyboardInterrupt:
        print("\n⏹️  Simulation arrêtée")

def main():
    """Fonction principale"""
    print("🐄 Test API DIAMA Render")
    print("=" * 40)
    
    # Test de connexion
    if not test_api_connection():
        print("❌ Impossible de se connecter à l'API")
        print("💡 Vérifiez que votre déploiement Render est actif")
        return
    
    # Test d'envoi de données
    if send_test_data():
        print("\n✅ API fonctionnelle!")
        
        # Demander si on veut simuler l'ESP32
        response = input("\n🤖 Voulez-vous simuler l'ESP32? (y/n): ")
        if response.lower() in ['y', 'yes', 'o', 'oui']:
            simulate_esp32()
    else:
        print("❌ Problème avec l'API")

if __name__ == "__main__":
    main() 