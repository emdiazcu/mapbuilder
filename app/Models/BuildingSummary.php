<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo de solo lectura respaldado por la vista v_buildings_summary.
 * No soporta inserción, actualización ni borrado.
 */
class BuildingSummary extends Model
{
    protected $table      = 'v_buildings_summary';
    protected $primaryKey = 'building_id';
    public    $timestamps = false;

    protected $casts = [
        'building_id'            => 'integer',
        'owner_id'               => 'integer',
        'spaces_count'           => 'integer',
        'total_schedules_count'  => 'integer',
        'active_schedules_count' => 'integer',
        'latitude'               => 'float',
        'longitude'              => 'float',
        'created_at'             => 'datetime',
        'updated_at'             => 'datetime',
    ];

    public function scopeOwnedBy($query, int $userId)
    {
        return $query->where('owner_id', $userId);
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('building_type', $type);
    }
}
