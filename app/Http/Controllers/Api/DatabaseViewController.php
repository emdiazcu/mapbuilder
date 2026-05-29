<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Building;
use App\Models\BuildingSummary;
use App\Models\SpaceOverview;
use App\Models\UserStatistic;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DatabaseViewController extends Controller
{
    // =========================================================================
    // VISTAS DE BASE DE DATOS
    // =========================================================================

    /**
     * GET /api/views/buildings
     * Devuelve v_buildings_summary.
     * Admin ve todos; usuario normal ve solo los suyos.
     */
    public function buildingsSummary(Request $request): JsonResponse
    {
        $user  = $request->user();
        $query = $user->hasRole('admin')
            ? BuildingSummary::query()
            : BuildingSummary::ownedBy($user->id);

        if ($type = $request->input('type')) {
            $query->byType($type);
        }

        return response()->json($query->orderBy('building_name')->get());
    }

    /**
     * GET /api/views/spaces
     * Devuelve v_spaces_overview filtrada por los edificios del usuario.
     */
    public function spacesOverview(Request $request): JsonResponse
    {
        $user  = $request->user();
        $query = SpaceOverview::query();

        if (! $user->hasRole('admin')) {
            $buildingIds = $user->buildings()->pluck('id');
            $query->whereIn('building_id', $buildingIds);
        }

        if ($buildingId = $request->input('building_id')) {
            $query->byBuilding((int) $buildingId);
        }

        if ($type = $request->input('type')) {
            $query->byType($type);
        }

        return response()->json($query->orderBy('building_name')->orderBy('space_name')->get());
    }

    /**
     * GET /api/views/user-stats
     * Devuelve v_user_statistics. Solo admin.
     */
    public function userStatistics(Request $request): JsonResponse
    {
        if (! $request->user()->hasRole('admin')) {
            return response()->json(['message' => 'Acceso denegado.'], 403);
        }

        return response()->json(
            UserStatistic::orderByDesc('buildings_count')->get()
        );
    }

    // =========================================================================
    // STORED PROCEDURES / FUNCIONES
    // =========================================================================

    /**
     * GET /api/procedures/building-stats/{id}
     * Llama a fn_get_building_stats(p_building_id).
     */
    public function buildingStats(Request $request, int $id): JsonResponse
    {
        $building = Building::findOrFail($id);

        if (! $request->user()->hasRole('admin') && $building->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Acceso denegado.'], 403);
        }

        $result = DB::select('SELECT * FROM fn_get_building_stats(?)', [$id]);

        return response()->json($result[0] ?? null);
    }

    /**
     * GET /api/procedures/open-spaces?day=1&time=10:00
     * Llama a fn_get_open_spaces(p_day_of_week, p_time).
     * day_of_week: 0=Dom, 1=Lun … 6=Sáb. Por defecto: día y hora actuales.
     */
    public function openSpaces(Request $request): JsonResponse
    {
        $request->validate([
            'day'  => 'nullable|integer|min:0|max:6',
            'time' => 'nullable|date_format:H:i',
        ]);

        $day  = $request->input('day',  now()->dayOfWeek);
        $time = $request->input('time', now()->format('H:i'));

        $result = DB::select(
            'SELECT * FROM fn_get_open_spaces(?, ?::time)',
            [(int) $day, $time]
        );

        return response()->json($result);
    }

    /**
     * POST /api/procedures/transfer-building
     * Llama a sp_transfer_building(p_building_id, p_new_owner_id). Solo admin.
     */
    public function transferBuilding(Request $request): JsonResponse
    {
        if (! $request->user()->hasRole('admin')) {
            return response()->json(['message' => 'Acceso denegado.'], 403);
        }

        $data = $request->validate([
            'building_id'   => 'required|integer|exists:buildings,id',
            'new_owner_id'  => 'required|integer|exists:users,id',
        ]);

        DB::statement(
            'CALL sp_transfer_building(?, ?)',
            [$data['building_id'], $data['new_owner_id']]
        );

        return response()->json([
            'message' => 'Edificio transferido correctamente.',
        ]);
    }
}
