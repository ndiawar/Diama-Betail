<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VacheProductionLait extends Model
{
    use HasFactory;

    /**
     * Les attributs qui sont assignables en masse.
     */
    protected $fillable = [
        'vache_id',
        'production_lait',
        'timestamp',
    ];

    /**
     * Les attributs qui doivent être castés.
     */
    protected $casts = [
        'production_lait' => 'float',
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
     * Scope pour les productions récentes.
     */
    public function scopeRecent($query, $hours = 24)
    {
        return $query->where('timestamp', '>=', now()->subHours($hours));
    }

    /**
     * Scope pour les productions journalières.
     */
    public function scopeJournalieres($query, $date = null)
    {
        $date = $date ?? now()->toDateString();
        return $query->whereDate('timestamp', $date);
    }

    /**
     * Scope pour les productions hebdomadaires.
     */
    public function scopeHebdomadaires($query, $weekStart = null)
    {
        $weekStart = $weekStart ?? now()->startOfWeek();
        return $query->whereBetween('timestamp', [
            $weekStart,
            $weekStart->copy()->endOfWeek()
        ]);
    }

    /**
     * Obtenir la production moyenne sur une période.
     */
    public static function getProductionMoyenne($vacheId, $hours = 24)
    {
        return static::where('vache_id', $vacheId)
            ->recent($hours)
            ->avg('production_lait');
    }

    /**
     * Obtenir la production totale journalière.
     */
    public static function getProductionJournaliere($vacheId, $date = null)
    {
        return static::where('vache_id', $vacheId)
            ->journalieres($date)
            ->sum('production_lait');
    }

    /**
     * Obtenir la production totale hebdomadaire.
     */
    public static function getProductionHebdomadaire($vacheId, $weekStart = null)
    {
        return static::where('vache_id', $vacheId)
            ->hebdomadaires($weekStart)
            ->sum('production_lait');
    }
}
