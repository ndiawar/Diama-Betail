<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\Vache;
use App\Models\VachePosition;

class VachePositionsHistorySeeder extends Seeder
{
    /**
     * Seed de l'historique des positions avec des lieux réels du Sénégal
     */
    public function run(): void
    {
        // Lieux authentiques du Sénégal avec coordonnées précises
        $lieuxSenegal = [
            [
                'nom' => 'Grand Mbao',
                'latitude' => 14.7305975,
                'longitude' => -17.321913,
                'altitude' => 15.2
            ],
            [
                'nom' => 'Colobane',
                'latitude' => 14.6928,
                'longitude' => -17.4467,
                'altitude' => 22.8
            ],
            [
                'nom' => 'Sacré Coeur 3',
                'latitude' => 14.7247,
                'longitude' => -17.4694,
                'altitude' => 28.5
            ],
            [
                'nom' => 'Cité Keur Gorgui',
                'latitude' => 14.7156,
                'longitude' => -17.4747,
                'altitude' => 18.3
            ],
            [
                'nom' => 'VDN Dakar',
                'latitude' => 14.7392,
                'longitude' => -17.4856,
                'altitude' => 35.7
            ],
            [
                'nom' => 'Liberté 6',
                'latitude' => 14.7589,
                'longitude' => -17.4392,
                'altitude' => 25.1
            ],
            [
                'nom' => 'Ouakam',
                'latitude' => 14.7167,
                'longitude' => -17.4894,
                'altitude' => 42.6
            ]
        ];

        // Créer des vaches de test si elles n'existent pas
        $vaches = $this->createTestVaches();

        echo "🌍 Création de l'historique des positions pour les lieux du Sénégal...\n";

        foreach ($vaches as $vache) {
            echo "📍 Génération historique pour la vache: {$vache->nom}\n";
            
            // Créer un historique de positions sur les 30 derniers jours
            $this->createPositionHistory($vache, $lieuxSenegal);
        }

        echo "✅ Seeding de l'historique des positions terminé !\n";
        echo "📊 Total positions créées: " . VachePosition::count() . "\n";
        echo "🐄 Vaches avec historique: " . Vache::count() . "\n";
    }

    /**
     * Créer des vaches de test
     */
    private function createTestVaches(): array
    {
        $vachesData = [
            [
                'id_rfid' => '04 A3 B2 1C',
                'nom' => 'Diama',
                'race' => 'N\'Dama',
                'sexe' => 'Femelle',
                'age' => 4,
                'poids' => 430.5,
                'temperature' => 38.5,
                'production_lait' => 25.0,
                'statut_sante' => 'bonne',
                'dernier_vaccin' => '2024-12-15',
                'date_mise_bas' => '2025-04-02',
                'nb_portees' => 3,
                'gps_actif' => true,
            ],
            [
                'id_rfid' => '04 B4 C3 2D',
                'nom' => 'Fatou',
                'race' => 'Zébu Gobra',
                'sexe' => 'Femelle',
                'age' => 6,
                'poids' => 485.2,
                'temperature' => 38.2,
                'production_lait' => 30.5,
                'statut_sante' => 'bonne',
                'dernier_vaccin' => '2024-11-20',
                'date_mise_bas' => '2024-08-15',
                'nb_portees' => 5,
                'gps_actif' => true,
            ],
            [
                'id_rfid' => '04 C5 D4 3E',
                'nom' => 'Yacine',
                'race' => 'Maure',
                'sexe' => 'Male',
                'age' => 5,
                'poids' => 520.8,
                'temperature' => 38.8,
                'production_lait' => 0,
                'statut_sante' => 'attention',
                'dernier_vaccin' => '2024-10-05',
                'date_mise_bas' => null,
                'nb_portees' => 0,
                'gps_actif' => true,
            ],
            [
                'id_rfid' => '04 D6 E5 4F',
                'nom' => 'Aminata',
                'race' => 'N\'Dama',
                'sexe' => 'Femelle',
                'age' => 3,
                'poids' => 395.0,
                'temperature' => 38.4,
                'production_lait' => 18.2,
                'statut_sante' => 'bonne',
                'dernier_vaccin' => '2024-12-01',
                'date_mise_bas' => '2025-02-10',
                'nb_portees' => 1,
                'gps_actif' => true,
            ],
            [
                'id_rfid' => '04 E7 F6 5G',
                'nom' => 'Mamadou',
                'race' => 'Zébu Peul',
                'sexe' => 'Male',
                'age' => 7,
                'poids' => 580.3,
                'temperature' => 39.1,
                'production_lait' => 0,
                'statut_sante' => 'bonne',
                'dernier_vaccin' => '2024-09-15',
                'date_mise_bas' => null,
                'nb_portees' => 0,
                'gps_actif' => true,
            ],
            [
                'id_rfid' => '04 F8 G7 6H',
                'nom' => 'Khady',
                'race' => 'Métisse',
                'sexe' => 'Femelle',
                'age' => 4,
                'poids' => 410.7,
                'temperature' => 38.3,
                'production_lait' => 22.8,
                'statut_sante' => 'bonne',
                'dernier_vaccin' => '2024-11-10',
                'date_mise_bas' => '2024-12-20',
                'nb_portees' => 2,
                'gps_actif' => true,
            ],
            [
                'id_rfid' => '04 G9 H8 7I',
                'nom' => 'Ibrahima',
                'race' => 'Zébu Gobra',
                'sexe' => 'Male',
                'age' => 6,
                'poids' => 615.5,
                'temperature' => 38.9,
                'production_lait' => 0,
                'statut_sante' => 'malade',
                'dernier_vaccin' => '2024-08-30',
                'date_mise_bas' => null,
                'nb_portees' => 0,
                'gps_actif' => false,
            ]
        ];

        $vaches = [];
        foreach ($vachesData as $data) {
            // Utiliser updateOrCreate pour éviter les doublons
            $vache = Vache::updateOrCreate(
                ['id_rfid' => $data['id_rfid']],
                array_merge($data, [
                    'latitude' => 14.7305975, // Position initiale à Grand Mbao
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
     * Créer l'historique des positions pour une vache
     */
    private function createPositionHistory(Vache $vache, array $lieux): void
    {
        // Générer des positions sur les 30 derniers jours
        $dateDebut = Carbon::now()->subDays(30);
        $dateFin = Carbon::now();
        
        $currentDate = $dateDebut->copy();
        $lieuActuel = 0;
        
        while ($currentDate <= $dateFin) {
            // Changer de lieu environ tous les 3-5 jours
            if ($currentDate->diffInDays($dateDebut) % rand(3, 5) === 0) {
                $lieuActuel = ($lieuActuel + 1) % count($lieux);
            }
            
            $lieu = $lieux[$lieuActuel];
            
            // Ajouter une petite variation aux coordonnées (simulation de mouvement naturel)
            $latitudeVariation = (rand(-50, 50) / 100000); // ±0.0005 degrés
            $longitudeVariation = (rand(-50, 50) / 100000);
            $altitudeVariation = rand(-5, 5) / 10; // ±0.5 mètres
            
            $latitude = $lieu['latitude'] + $latitudeVariation;
            $longitude = $lieu['longitude'] + $longitudeVariation;
            $altitude = $lieu['altitude'] + $altitudeVariation;
            
            // Créer plusieurs positions par jour (toutes les 2-4 heures)
            for ($heure = 0; $heure < 24; $heure += rand(2, 4)) {
                $timestamp = $currentDate->copy()->addHours($heure)->addMinutes(rand(0, 59));
                
                // Éviter les doublons
                $existingPosition = VachePosition::where('vache_id', $vache->id)
                    ->where('timestamp', $timestamp)
                    ->first();
                
                if (!$existingPosition) {
                    VachePosition::create([
                        'vache_id' => $vache->id,
                        'latitude' => $latitude,
                        'longitude' => $longitude,
                        'altitude' => $altitude,
                        'timestamp' => $timestamp,
                    ]);
                }
            }
            
            $currentDate->addDay();
        }
        
        // Mettre à jour la position actuelle de la vache avec la dernière position
        $dernierePosition = VachePosition::where('vache_id', $vache->id)
            ->orderBy('timestamp', 'desc')
            ->first();
        
        if ($dernierePosition) {
            $vache->update([
                'latitude' => $dernierePosition->latitude,
                'longitude' => $dernierePosition->longitude,
                'altitude' => $dernierePosition->altitude,
                'derniere_position_at' => $dernierePosition->timestamp,
                'derniere_mise_a_jour_at' => now(),
            ]);
        }
        
        echo "  ✅ {$vache->nom}: " . $vache->positions()->count() . " positions créées\n";
    }
}
