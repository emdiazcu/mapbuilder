<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Space extends Model
{
    use HasFactory;

    protected $fillable = [
        'building_id',
        'name',
        'type',
        'description',
        'polygon_data',
        'color',
    ];

    protected $casts = [
        'polygon_data' => 'array',
    ];

    // ── Relaciones ───────────────────────────────────────────

    public function building(): BelongsTo
    {
        return $this->belongsTo(Building::class);
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(Schedule::class);
    }

    // ── Scopes ───────────────────────────────────────────────

    public function scopeSearch($query, string $term)
    {
        $lower = strtolower($term);

        return $query->where(function ($q) use ($lower) {
            $q->whereRaw('LOWER(name) LIKE ?', ["%{$lower}%"])
              ->orWhereRaw('LOWER(type) LIKE ?', ["%{$lower}%"]);
        });
    }

    public function scopeActive($query)
    {
        return $query->whereHas('schedules', fn ($q) => $q->where('is_active', true));
    }
}
