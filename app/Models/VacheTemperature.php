<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VacheTemperature extends Model
{
    use HasFactory;

    /**
     * Les attributs qui sont assignables en masse.
     */
    protected $fillable = [
        'vache_id',
        'temperature',
        'statut_sante',
        'timestamp',
    ];

    /**
     * Les attributs qui doivent être castés.
     */
    protected $casts = [
        'temperature' => 'float',
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
     * Scope pour les températures récentes.
     */
    public function scopeRecent($query, $hours = 24)
    {
        return $query->where('timestamp', '>=', now()->subHours($hours));
    }

    /**
     * Scope pour les températures anormales.
     */
    public function scopeAnormales($query)
    {
        return $query->where('temperature', '>', 39.0);
    }

    /**
     * Scope pour les températures normales.
     */
    public function scopeNormales($query)
    {
        return $query->whereBetween('temperature', [37.5, 39.0]);
    }

    /**
     * Obtenir la température moyenne sur une période.
     */
    public static function getTemperatureMoyenne($vacheId, $hours = 24)
    {
        return static::where('vache_id', $vacheId)
            ->recent($hours)
            ->avg('temperature');
    }
}
