<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\Vache;
use App\Models\VachePosition;

class ProductionSeeder extends Seeder
{
    /**
     * Seeder optimisé pour la production avec données réelles du Sénégal
     */
    public function run(): void
    {
        // Vérifier si des vaches existent déjà pour éviter les doublons
        if (Vache::count() > 0) {
            $this->command->info('🔄 Des vaches existent déjà. Mise à jour des données...');
            $this->updateExistingData();
            return;
        }

        $this->command->info('🌍 Initialisation production - Données historiques Sénégal');
        
        // Lieux authentiques du Sénégal avec coordonnées précises
        $lieuxSenegal = [
            ['nom' => 'Grand Mbao', 'lat' => 14.7305975, 'lng' => -17.321913, 'alt' => 15.2],
            ['nom' => 'Colobane', 'lat' => 14.6928, 'lng' => -17.4467, 'alt' => 22.8],
            ['nom' => 'Sacré Coeur 3', 'lat' => 14.7247, 'lng' => -17.4694, 'alt' => 28.5],
            ['nom' => 'Cité Keur Gorgui', 'lat' => 14.7156, 'lng' => -17.4747, 'alt' => 18.3],
            ['nom' => 'VDN Dakar', 'lat' => 14.7392, 'lng' => -17.4856, 'alt' => 35.7],
            ['nom' => 'Liberté 6', 'lat' => 14.7589, 'lng' => -17.4392, 'alt' => 25.1],
            ['nom' => 'Ouakam', 'lat' => 14.7167, 'lng' => -17.4894, 'alt' => 42.6]
        ];

        // Créer les vaches
        $vaches = $this->createProductionVaches();
        
        // Créer l'historique optimisé
        $this->createOptimizedHistory($vaches, $lieuxSenegal);
        
        $this->command->info('✅ Production seeding terminé !');
        $this->command->info("📊 {$this->countRecords()} enregistrements créés");
    }

    /**
     * Créer les vaches pour la production
     */
    private function createProductionVaches(): array
    {
        $vachesData = [
            [
                'id_rfid' => '04 A3 B2 1C', 'nom' => 'Diama', 'race' => 'N\'Dama',
                'sexe' => 'Femelle', 'age' => 4, 'poids' => 430.5, 'temperature' => 38.5,
                'production_lait' => 25.0, 'statut_sante' => 'bonne', 'nb_portees' => 3, 'gps_actif' => true
            ],
            [
                'id_rfid' => '04 B4 C3 2D', 'nom' => 'Fatou', 'race' => 'Zébu Gobra',
                'sexe' => 'Femelle', 'age' => 6, 'poids' => 485.2, 'temperature' => 38.2,
                'production_lait' => 30.5, 'statut_sante' => 'bonne', 'nb_portees' => 5, 'gps_actif' => true
            ],
            [
                'id_rfid' => '04 C5 D4 3E', 'nom' => 'Yacine', 'race' => 'Maure',
                'sexe' => 'Male', 'age' => 5, 'poids' => 520.8, 'temperature' => 38.8,
                'production_lait' => 0, 'statut_sante' => 'attention', 'nb_portees' => 0, 'gps_actif' => true
            ],
            [
                'id_rfid' => '04 D6 E5 4F', 'nom' => 'Aminata', 'race' => 'N\'Dama',
                'sexe' => 'Femelle', 'age' => 3, 'poids' => 395.0, 'temperature' => 38.4,
                'production_lait' => 18.2, 'statut_sante' => 'bonne', 'nb_portees' => 1, 'gps_actif' => true
            ],
            [
                'id_rfid' => '04 E7 F6 5G', 'nom' => 'Mamadou', 'race' => 'Zébu Peul',
                'sexe' => 'Male', 'age' => 7, 'poids' => 580.3, 'temperature' => 39.1,
                'production_lait' => 0, 'statut_sante' => 'bonne', 'nb_portees' => 0, 'gps_actif' => true
            ]
        ];

        $vaches = [];
        foreach ($vachesData as $data) {
            $vache = Vache::updateOrCreate(
                ['id_rfid' => $data['id_rfid']],
                array_merge($data, [
                    'dernier_vaccin' => '2024-12-15',
                    'date_mise_bas' => $data['sexe'] === 'Femelle' ? '2025-04-02' : null,
                    'latitude' => 14.7305975,
                    'longitude' => -17.321913,
                    'altitude' => 15.2,
                    'derniere_position_at' => now(),
                    'derniere_mise_a_jour_at' => now(),
                ])
            );
            $vaches[] = $vache;
        }

        return $vaches;
    }

    /**
     * Créer un historique optimisé pour la production
     */
    private function createOptimizedHistory(array $vaches, array $lieux): void
    {
        // Historique réduit pour la production (7 derniers jours)
        $dateDebut = Carbon::now()->subDays(7);
        $dateFin = Carbon::now();

        foreach ($vaches as $index => $vache) {
            $lieuIndex = $index % count($lieux);
            $lieu = $lieux[$lieuIndex];
            
            // 2-3 positions par jour seulement en production
            $positions = [];
            $currentDate = $dateDebut->copy();
            
            while ($currentDate <= $dateFin) {
                for ($i = 0; $i < 3; $i++) {
                    $heure = $i * 8; // 0h, 8h, 16h
                    $timestamp = $currentDate->copy()->addHours($heure);
                    
                    // Variation micro pour simulation réaliste
                    $lat = $lieu['lat'] + (rand(-20, 20) / 100000);
                    $lng = $lieu['lng'] + (rand(-20, 20) / 100000);
                    $alt = $lieu['alt'] + (rand(-2, 2) / 10);
                    
                    $positions[] = [
                        'vache_id' => $vache->id,
                        'latitude' => $lat,
                        'longitude' => $lng,
                        'altitude' => $alt,
                        'timestamp' => $timestamp,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
                $currentDate->addDay();
            }
            
            // Insertion en batch pour performance
            if (!empty($positions)) {
                VachePosition::insert($positions);
            }
            
            // Mettre à jour position actuelle
            $lastPosition = end($positions);
            if ($lastPosition) {
                $vache->update([
                    'latitude' => $lastPosition['latitude'],
                    'longitude' => $lastPosition['longitude'],
                    'altitude' => $lastPosition['altitude'],
                    'derniere_position_at' => $lastPosition['timestamp'],
                ]);
            }
        }
    }

    /**
     * Mettre à jour les données existantes
     */
    private function updateExistingData(): void
    {
        // Vérifier si l'historique existe
        $positionsCount = VachePosition::count();
        
        if ($positionsCount < 50) {
            $this->command->info('📈 Ajout historique manquant...');
            $vaches = Vache::all();
            $lieuxSenegal = [
                ['nom' => 'Grand Mbao', 'lat' => 14.7305975, 'lng' => -17.321913, 'alt' => 15.2],
                ['nom' => 'Colobane', 'lat' => 14.6928, 'lng' => -17.4467, 'alt' => 22.8],
            ];
            $this->createOptimizedHistory($vaches->toArray(), $lieuxSenegal);
        }
        
        $this->command->info("✅ Données mises à jour - {$this->countRecords()} enregistrements");
    }

    /**
     * Compter les enregistrements
     */
    private function countRecords(): string
    {
        $vaches = Vache::count();
        $positions = VachePosition::count();
        return "{$vaches} vaches, {$positions} positions";
    }
}
