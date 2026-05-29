<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Building;
use Illuminate\View\View;

class PublicMapController extends Controller
{
    /** GET /map/{token} — vista pública sin autenticación */
    public function show(string $token): View
    {
        $building = Building::where('public_token', $token)
            ->with(['spaces' => function ($q) {
                $q->with(['schedules' => fn ($s) => $s->where('is_active', true)->orderBy('day_of_week')]);
            }])
            ->firstOrFail();

        // Serializar aquí para evitar que Blade parsee fn() dentro de @json()
        $spacesData = $building->spaces->map(fn ($s) => [
            'id'           => $s->id,
            'name'         => $s->name,
            'type'         => $s->type,
            'color'        => $s->color,
            'polygon_data' => $s->polygon_data ?? [],
        ])->values()->all();

        return view('map.public', compact('building', 'spacesData'));
    }
}
