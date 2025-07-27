<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VachePosition extends Model
{
    use HasFactory;

    /**
     * Les attributs qui sont assignables en masse.
     */
    protected $fillable = [
        'vache_id',
        'latitude',
        'longitude',
        'altitude',
        'timestamp',
    ];

    /**
     * Les attributs qui doivent être castés.
     */
    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'altitude' => 'float',
        'timestamp' => 'datetime',
    ];

    /**
     * Relation avec la vache.
     */
    public function vache(): BelongsTo
    {
        return $this->belongsTo(Vache::class);
    }

    /**
     * Scope pour les positions récentes.
     */
    public function scopeRecent($query, $hours = 24)
    {
        return $query->where('timestamp', '>=', now()->subHours($hours));
    }

    /**
     * Scope pour les positions d'une période donnée.
     */
    public function scopeBetweenDates($query, $startDate, $endDate)
    {
        return $query->whereBetween('timestamp', [$startDate, $endDate]);
    }
}
