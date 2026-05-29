<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo de solo lectura respaldado por la vista v_user_statistics.
 * Acceso restringido a administradores (validar en el controlador).
 */
class UserStatistic extends Model
{
    protected $table      = 'v_user_statistics';
    protected $primaryKey = 'user_id';
    public    $timestamps = false;

    protected $casts = [
        'user_id'                => 'integer',
        'buildings_count'        => 'integer',
        'spaces_count'           => 'integer',
        'active_schedules_count' => 'integer',
        'total_schedules_count'  => 'integer',
        'registered_at'          => 'datetime',
    ];
}
