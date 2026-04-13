<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\BuildingResource;
use App\Models\Building;
use Illuminate\Http\JsonResponse;

class PublicMapController extends Controller
{
    /**
     * GET /api/maps/{token}/public
     * Acceso libre sin autenticación — devuelve el mapa completo por UUID.
     */
    public function show(string $token): JsonResponse
    {
        $building = Building::where('public_token', $token)
            ->with(['spaces' => function ($q) {
                $q->with(['schedules' => fn ($s) => $s->active()->orderBy('day_of_week')->orderBy('start_time')]);
            }])
            ->firstOrFail();

        return response()->json(new BuildingResource($building));
    }
}
