<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Vache extends Model
{
    use HasFactory;

    /**
     * Les attributs qui sont assignables en masse.
     */
    protected $fillable = [
        'id_rfid',
        'nom',
        'race',
        'sexe',
        'age',
        'poids',
        'temperature',
        'production_lait',
        'statut_sante',
        'dernier_vaccin',
        'prochaine_vaccination',
        'date_mise_bas',
        'nb_portees',
        'latitude',
        'longitude',
        'altitude',
        'gps_actif',
        'derniere_position_at',
        'derniere_mise_a_jour_at',
    ];

    /**
     * Les attributs qui doivent être castés.
     */
    protected $casts = [
        'poids' => 'float',
        'temperature' => 'float',
        'production_lait' => 'float',
        'age' => 'integer',
        'nb_portees' => 'integer',
        'latitude' => 'float',
        'longitude' => 'float',
        'altitude' => 'float',
        'gps_actif' => 'boolean',
        'dernier_vaccin' => 'date',
        'prochaine_vaccination' => 'date',
        'date_mise_bas' => 'date',
        'derniere_position_at' => 'datetime',
        'derniere_mise_a_jour_at' => 'datetime',
    ];

    /**
     * Les attributs qui doivent être cachés lors de la sérialisation.
     */
    protected $hidden = [
        'created_at',
        'updated_at',
    ];

    /**
     * Les attributs ajoutés lors de la sérialisation.
     */
    protected $appends = [
        'position',
        'statut_badge',
        'gps_badge',
        'age_annees',
    ];

    /**
     * Obtenir la position GPS sous forme d'objet.
     */
    public function getPositionAttribute(): array
    {
        return [
            'lat' => $this->latitude,
            'lng' => $this->longitude,
        ];
    }

    /**
     * Obtenir le badge de statut de santé.
     */
    public function getStatutBadgeAttribute(): string
    {
        return match($this->statut_sante) {
            'bonne' => 'success',
            'attention' => 'warning',
            'malade' => 'danger',
            default => 'primary',
        };
    }

    /**
     * Obtenir le badge de statut GPS.
     */
    public function getGpsBadgeAttribute(): string
    {
        return $this->gps_actif ? 'success' : 'danger';
    }

    /**
     * Obtenir l'âge en années.
     */
    public function getAgeAnneesAttribute(): int
    {
        return $this->age ?? 0;
    }

    /**
     * Relation avec l'historique des positions.
     */
    public function positions(): HasMany
    {
        return $this->hasMany(VachePosition::class);
    }

    /**
     * Relation avec l'historique des températures.
     */
    public function temperatures(): HasMany
    {
        return $this->hasMany(VacheTemperature::class);
    }

    /**
     * Relation avec l'historique de production de lait.
     */
    public function productionsLait(): HasMany
    {
        return $this->hasMany(VacheProductionLait::class);
    }

    /**
     * Scope pour les vaches en bonne santé.
     */
    public function scopeEnBonneSante($query)
    {
        return $query->where('statut_sante', 'bonne');
    }

    /**
     * Scope pour les vaches avec GPS actif.
     */
    public function scopeGpsActif($query)
    {
        return $query->where('gps_actif', true);
    }

    /**
     * Scope pour les vaches en gestation.
     */
    public function scopeEnGestation($query)
    {
        return $query->where('statut_sante', 'attention');
    }

    /**
     * Mettre à jour la position GPS.
     */
    public function updatePosition(float $latitude, float $longitude, float $altitude = null): void
    {
        $this->update([
            'latitude' => $latitude,
            'longitude' => $longitude,
            'altitude' => $altitude,
            'derniere_position_at' => now(),
            'derniere_mise_a_jour_at' => now(),
        ]);

        // Enregistrer dans l'historique
        $this->positions()->create([
            'latitude' => $latitude,
            'longitude' => $longitude,
            'altitude' => $altitude,
            'timestamp' => now(),
        ]);
    }

    /**
     * Mettre à jour les données de santé.
     */
    public function updateSante(float $temperature, string $statut_sante): void
    {
        $this->update([
            'temperature' => $temperature,
            'statut_sante' => $statut_sante,
            'derniere_mise_a_jour_at' => now(),
        ]);

        // Enregistrer dans l'historique
        $this->temperatures()->create([
            'temperature' => $temperature,
            'statut_sante' => $statut_sante,
            'timestamp' => now(),
        ]);
    }

    /**
     * Mettre à jour la production de lait.
     */
    public function updateProductionLait(float $production_lait): void
    {
        $this->update([
            'production_lait' => $production_lait,
            'derniere_mise_a_jour_at' => now(),
        ]);

        // Enregistrer dans l'historique
        $this->productionsLait()->create([
            'production_lait' => $production_lait,
            'timestamp' => now(),
        ]);
    }
}
