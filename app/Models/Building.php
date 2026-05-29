<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Building extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'description',
        'type',
        'latitude',
        'longitude',
        'is_favorite',
        'floor_plan_image',
        'public_token',
    ];

    protected $casts = [
        'latitude'    => 'float',
        'longitude'   => 'float',
        'is_favorite' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function (Building $building) {
            $building->public_token = (string) Str::uuid();
        });
    }

    // ── Relaciones ───────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function spaces(): HasMany
    {
        return $this->hasMany(Space::class);
    }

    // ── Scopes ───────────────────────────────────────────────

    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeSearch($query, string $term)
    {
        $lower = strtolower($term);

        return $query->where(function ($q) use ($lower) {
            $q->whereRaw('LOWER(name) LIKE ?', ["%{$lower}%"])
              ->orWhereRaw('LOWER(description) LIKE ?', ["%{$lower}%"]);
        });
    }

    public function scopeOwnedBy($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }
}
