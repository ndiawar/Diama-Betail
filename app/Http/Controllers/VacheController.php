<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use App\Models\Vache;
use App\Events\VacheUpdated;

class VacheController extends Controller
{
    /**
     * Mettre à jour les données d'une vache depuis l'ESP32
     */
    public function updateFromESP32(Request $request): JsonResponse
    {
        try {
            // Validation des données reçues
            $validated = $request->validate([
                'vache_id' => 'required|string',
                'nom' => 'required|string',
                'position.lat' => 'required|numeric',
                'position.lng' => 'required|numeric',
                'altitude' => 'nullable|numeric',
                'temperature' => 'required|numeric',
                'poids' => 'required|numeric',
                'production_lait' => 'required|numeric',
                'statut_sante' => 'required|string',
                'sexe' => 'required|string',
                'dernier_vaccin' => 'required|string',
                'date_mise_bas' => 'required|string',
                'nb_portees' => 'required|integer',
                'gps_actif' => 'required|boolean',
                'timestamp' => 'required|string',
            ]);

            // Log des données reçues
            Log::info('Données ESP32 reçues', $validated);

            // Rechercher ou créer la vache
            $vache = Vache::updateOrCreate(
                ['id_rfid' => $validated['vache_id']],
                [
                    'nom' => $validated['nom'],
                    'sexe' => $validated['sexe'],
                    'poids' => $validated['poids'],
                    'temperature' => $validated['temperature'],
                    'production_lait' => $validated['production_lait'],
                    'statut_sante' => $validated['statut_sante'],
                    'dernier_vaccin' => $validated['dernier_vaccin'],
                    'date_mise_bas' => $validated['date_mise_bas'],
                    'nb_portees' => $validated['nb_portees'],
                    'latitude' => $validated['position']['lat'],
                    'longitude' => $validated['position']['lng'],
                    'altitude' => $validated['altitude'],
                    'gps_actif' => $validated['gps_actif'],
                    'derniere_position_at' => now(),
                    'derniere_mise_a_jour_at' => now(),
                ]
            );

            // Mettre à jour l'historique
            $vache->updatePosition(
                $validated['position']['lat'],
                $validated['position']['lng'],
                $validated['altitude']
            );

            $vache->updateSante(
                $validated['temperature'],
                $validated['statut_sante']
            );

            $vache->updateProductionLait($validated['production_lait']);

            // Calculer les nouvelles statistiques
            $stats = [
                'total_vaches' => Vache::count(),
                'en_bonne_sante' => Vache::enBonneSante()->count(),
                'en_gestation' => Vache::enGestation()->count(),
                'gps_actif' => Vache::gpsActif()->count(),
                'temperature_moyenne' => Vache::avg('temperature'),
                'production_moyenne' => Vache::avg('production_lait'),
                'derniere_mise_a_jour' => Vache::max('derniere_mise_a_jour_at'),
            ];

            // Diffuser l'événement temps réel
            broadcast(new VacheUpdated($vache, $stats))->toOthers();

            $response = [
                'success' => true,
                'message' => 'Données vache mises à jour',
                'vache_id' => $vache->id_rfid,
                'vache_db_id' => $vache->id,
                'timestamp' => now()->toISOString(),
                'position' => [
                    'lat' => $vache->latitude,
                    'lng' => $vache->longitude
                ],
                'statut_sante' => $vache->statut_sante,
                'temperature' => $vache->temperature,
                'production_lait' => $vache->production_lait
            ];

            return response()->json($response, 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Erreur validation ESP32', $e->errors());
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            Log::error('Erreur traitement ESP32', [
                'message' => $e->getMessage(),
                'data' => $request->all()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur serveur',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupérer toutes les vaches
     */
    public function index(): JsonResponse
    {
        try {
            $vaches = Vache::with(['positions' => function($query) {
                $query->recent(24)->orderBy('timestamp', 'desc');
            }])
            ->orderBy('derniere_mise_a_jour_at', 'desc')
            ->get();

            return response()->json([
                'success' => true,
                'data' => $vaches,
                'count' => $vaches->count()
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur récupération vaches', [
                'message' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur récupération des données',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupérer une vache spécifique
     */
    public function show(string $id): JsonResponse
    {
        try {
            $vache = Vache::with([
                'positions' => function($query) {
                    $query->recent(168)->orderBy('timestamp', 'desc'); // 7 jours
                },
                'temperatures' => function($query) {
                    $query->recent(168)->orderBy('timestamp', 'desc');
                },
                'productionsLait' => function($query) {
                    $query->recent(168)->orderBy('timestamp', 'desc');
                }
            ])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $vache
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Vache non trouvée'
            ], 404);

        } catch (\Exception $e) {
            Log::error('Erreur récupération vache', [
                'id' => $id,
                'message' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur récupération des données',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupérer les statistiques du troupeau
     */
    public function stats(): JsonResponse
    {
        try {
            $stats = [
                'total_vaches' => Vache::count(),
                'en_bonne_sante' => Vache::enBonneSante()->count(),
                'en_gestation' => Vache::enGestation()->count(),
                'gps_actif' => Vache::gpsActif()->count(),
                'temperature_moyenne' => Vache::avg('temperature'),
                'production_moyenne' => Vache::avg('production_lait'),
                'derniere_mise_a_jour' => Vache::max('derniere_mise_a_jour_at'),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur calcul statistiques', [
                'message' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur calcul des statistiques',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Modifier une vache
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $vache = Vache::findOrFail($id);
            
            // Validation des données
            $validated = $request->validate([
                'nom' => 'sometimes|string|max:255',
                'race' => 'sometimes|string|max:255|nullable',
                'statut_sante' => 'sometimes|string|in:bonne,attention,malade',
                'gps_actif' => 'sometimes|boolean',
                'sexe' => 'sometimes|string|in:Male,Femelle',
                'poids' => 'sometimes|numeric|min:0',
                'temperature' => 'sometimes|numeric|min:30|max:45',
                'production_lait' => 'sometimes|numeric|min:0',
            ]);

            // Mise à jour de la vache
            $vache->update($validated);
            $vache->derniere_mise_a_jour_at = now();
            $vache->save();

            Log::info('Vache modifiée', [
                'id' => $id,
                'nom' => $vache->nom,
                'modifications' => $validated
            ]);

            return response()->json([
                'success' => true,
                'message' => "Vache {$vache->nom} mise à jour avec succès",
                'data' => $vache
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Vache non trouvée'
            ], 404);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            Log::error('Erreur modification vache', [
                'id' => $id,
                'message' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la modification',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Créer une nouvelle vache
     */
    public function store(Request $request): JsonResponse
    {
        try {
            // Validation des données
            $validated = $request->validate([
                'nom' => 'required|string|max:255',
                'race' => 'nullable|string|max:255',
                'sexe' => 'required|string|in:Male,Femelle',
                'statut_sante' => 'required|string|in:bonne,attention,malade',
                'poids' => 'required|numeric|min:0',
                'temperature' => 'required|numeric|min:30|max:45',
                'production_lait' => 'required|numeric|min:0',
                'gps_actif' => 'boolean',
                'id_rfid' => 'nullable|string|unique:vaches,id_rfid',
                'dernier_vaccin' => 'nullable|date',
                'date_mise_bas' => 'nullable|date',
                'nb_portees' => 'nullable|integer|min:0',
                'latitude' => 'nullable|numeric',
                'longitude' => 'nullable|numeric',
                'altitude' => 'nullable|numeric',
            ]);

            // Valeurs par défaut
            $validated['gps_actif'] = $validated['gps_actif'] ?? false;
            $validated['id_rfid'] = $validated['id_rfid'] ?? 'MANUEL_' . time();
            $validated['derniere_position_at'] = now();
            $validated['derniere_mise_a_jour_at'] = now();

            // Créer la vache
            $vache = Vache::create($validated);

            Log::info('Nouvelle vache créée', [
                'id' => $vache->id,
                'nom' => $vache->nom
            ]);

            return response()->json([
                'success' => true,
                'message' => "Vache {$vache->nom} créée avec succès",
                'data' => $vache
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            Log::error('Erreur création vache', [
                'message' => $e->getMessage(),
                'data' => $request->all()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprimer une vache
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $vache = Vache::findOrFail($id);
            $nomVache = $vache->nom;
            
            // Supprimer les données associées (positions, températures, productions)
            $vache->positions()->delete();
            $vache->temperatures()->delete();
            $vache->productionsLait()->delete();
            
            // Supprimer la vache
            $vache->delete();

            Log::info('Vache supprimée', [
                'id' => $id,
                'nom' => $nomVache
            ]);

            return response()->json([
                'success' => true,
                'message' => "Vache {$nomVache} supprimée avec succès"
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Vache non trouvée'
            ], 404);

        } catch (\Exception $e) {
            Log::error('Erreur suppression vache', [
                'id' => $id,
                'message' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupérer l'historique des positions
     */
    public function positionHistory(Request $request): JsonResponse
    {
        try {
            // Validation des paramètres
            $validated = $request->validate([
                'vache_id' => 'nullable|exists:vaches,id',
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date|after_or_equal:start_date',
                'limit' => 'nullable|integer|min:1|max:1000',
                'page' => 'nullable|integer|min:1',
            ]);

            $query = \App\Models\VachePosition::with('vache:id,nom,id_rfid')
                ->orderBy('timestamp', 'desc');

            // Filtrer par vache spécifique
            if (isset($validated['vache_id'])) {
                $query->where('vache_id', $validated['vache_id']);
            }

            // Filtrer par période
            if (isset($validated['start_date']) && isset($validated['end_date'])) {
                $query->betweenDates($validated['start_date'], $validated['end_date']);
            } elseif (isset($validated['start_date'])) {
                $query->where('timestamp', '>=', $validated['start_date']);
            } elseif (isset($validated['end_date'])) {
                $query->where('timestamp', '<=', $validated['end_date']);
            } else {
                // Par défaut, historique des 30 derniers jours
                $query->where('timestamp', '>=', now()->subDays(30));
            }

            // Pagination
            $limit = $validated['limit'] ?? 50;
            $page = $validated['page'] ?? 1;
            
            $positions = $query->paginate($limit, ['*'], 'page', $page);

            // Statistiques
            $stats = [
                'total_positions' => $positions->total(),
                'vaches_trackees' => \App\Models\VachePosition::distinct('vache_id')->count(),
                'premiere_position' => \App\Models\VachePosition::min('timestamp'),
                'derniere_position' => \App\Models\VachePosition::max('timestamp'),
            ];

            return response()->json([
                'success' => true,
                'data' => $positions->items(),
                'pagination' => [
                    'current_page' => $positions->currentPage(),
                    'total_pages' => $positions->lastPage(),
                    'per_page' => $positions->perPage(),
                    'total' => $positions->total(),
                    'has_next' => $positions->hasMorePages(),
                    'has_previous' => $positions->currentPage() > 1,
                ],
                'stats' => $stats,
                'filters' => $validated
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Paramètres invalides',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            Log::error('Erreur récupération historique positions', [
                'message' => $e->getMessage(),
                'filters' => $request->all()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur récupération historique',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupérer l'historique des positions pour une vache spécifique
     */
    public function vachePositionHistory(string $id, Request $request): JsonResponse
    {
        try {
            $vache = Vache::findOrFail($id);

            // Validation des paramètres
            $validated = $request->validate([
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date|after_or_equal:start_date',
                'limit' => 'nullable|integer|min:1|max:1000',
            ]);

            $query = $vache->positions()->orderBy('timestamp', 'desc');

            // Filtrer par période
            if (isset($validated['start_date']) && isset($validated['end_date'])) {
                $query->betweenDates($validated['start_date'], $validated['end_date']);
            } elseif (isset($validated['start_date'])) {
                $query->where('timestamp', '>=', $validated['start_date']);
            } elseif (isset($validated['end_date'])) {
                $query->where('timestamp', '<=', $validated['end_date']);
            } else {
                // Par défaut, historique des 7 derniers jours
                $query->recent(168); // 7 jours = 168 heures
            }

            $limit = $validated['limit'] ?? 100;
            $positions = $query->limit($limit)->get();

            // Calculer la distance parcourue
            $distanceParcourue = 0;
            for ($i = 1; $i < count($positions); $i++) {
                $distanceParcourue += $this->calculateDistance(
                    $positions[$i-1]->latitude, $positions[$i-1]->longitude,
                    $positions[$i]->latitude, $positions[$i]->longitude
                );
            }

            $stats = [
                'total_positions' => $positions->count(),
                'distance_parcourue_km' => round($distanceParcourue, 2),
                'premiere_position' => $positions->last()?->timestamp,
                'derniere_position' => $positions->first()?->timestamp,
                'zone_activite' => [
                    'lat_min' => $positions->min('latitude'),
                    'lat_max' => $positions->max('latitude'),
                    'lng_min' => $positions->min('longitude'),
                    'lng_max' => $positions->max('longitude'),
                ]
            ];

            return response()->json([
                'success' => true,
                'vache' => [
                    'id' => $vache->id,
                    'nom' => $vache->nom,
                    'id_rfid' => $vache->id_rfid
                ],
                'positions' => $positions,
                'stats' => $stats,
                'filters' => $validated
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Vache non trouvée'
            ], 404);

        } catch (\Exception $e) {
            Log::error('Erreur historique positions vache', [
                'vache_id' => $id,
                'message' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur récupération historique',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Calculer la distance entre deux points GPS (formule de Haversine)
     */
    private function calculateDistance($lat1, $lon1, $lat2, $lon2): float
    {
        $earthRadius = 6371; // Rayon de la Terre en km

        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat/2) * sin($dLat/2) + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLon/2) * sin($dLon/2);
        $c = 2 * atan2(sqrt($a), sqrt(1-$a));

        return $earthRadius * $c;
    }

    /**
     * Statut de santé du système
     */
    public function health(): JsonResponse
    {
        try {
            $dbStatus = DB::connection()->getPdo() ? 'connected' : 'disconnected';
            
            return response()->json([
                'success' => true,
                'message' => 'API DIAMA opérationnelle',
                'timestamp' => now()->toISOString(),
                'version' => '1.0.0',
                'status' => 'healthy',
                'database' => $dbStatus,
                'vaches_count' => Vache::count()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'API DIAMA en erreur',
                'timestamp' => now()->toISOString(),
                'version' => '1.0.0',
                'status' => 'unhealthy',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 