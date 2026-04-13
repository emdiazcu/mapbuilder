<?php

namespace App\Policies;

use App\Models\Building;
use App\Models\User;

class BuildingPolicy
{
    /**
     * Admins ven todo; users solo lo suyo.
     */
    public function view(User $user, Building $building): bool
    {
        return $user->hasRole('admin') || $building->user_id === $user->id;
    }

    /**
     * Cualquier usuario autenticado puede crear edificios.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Solo el dueño o admin puede editar.
     */
    public function update(User $user, Building $building): bool
    {
        return $user->hasRole('admin') || $building->user_id === $user->id;
    }

    /**
     * Solo el dueño o admin puede eliminar.
     */
    public function delete(User $user, Building $building): bool
    {
        return $user->hasRole('admin') || $building->user_id === $user->id;
    }
}
