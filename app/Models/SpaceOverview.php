<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo de solo lectura respaldado por la vista v_spaces_overview.
 */
class SpaceOverview extends Model
{
    protected $table      = 'v_spaces_overview';
    protected $primaryKey = 'space_id';
    public    $timestamps = false;

    protected $casts = [
        'space_id'               => 'integer',
        'building_id'            => 'integer',
        'total_schedules_count'  => 'integer',
        'active_schedules_count' => 'integer',
        'created_at'             => 'datetime',
    ];

    public function scopeByBuilding($query, int $buildingId)
    {
        return $query->where('building_id', $buildingId);
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('space_type', $type);
    }
}
