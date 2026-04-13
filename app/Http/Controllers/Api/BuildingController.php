<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBuildingRequest;
use App\Http\Requests\UpdateBuildingRequest;
use App\Http\Resources\BuildingCollection;
use App\Http\Resources\BuildingResource;
use App\Models\Building;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;

class BuildingController extends Controller
{
    /**
     * GET /api/buildings
     * Lista paginada con búsqueda por nombre y tipo.
     */
    public function index(Request $request): BuildingCollection
    {
        $user  = $request->user();
        $query = $user->hasRole('admin')
            ? Building::withCount('spaces')
            : Building::ownedBy($user->id)->withCount('spaces');

        if ($search = $request->input('search')) {
            $query->search($search);
        }

        if ($type = $request->input('type')) {
            $query->byType($type);
        }

        $buildings = $query
            ->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 15));

        return new BuildingCollection($buildings);
    }

    /**
     * POST /api/buildings
     */
    public function store(StoreBuildingRequest $request): JsonResponse
    {
        $data = $request->validated();

        if ($request->hasFile('floor_plan_image')) {
            $data['floor_plan_image'] = $request->file('floor_plan_image')
                ->store('floor_plans', 'public');
        }

        $building = $request->user()->buildings()->create($data);

        return response()->json(new BuildingResource($building), 201);
    }

    /**
     * GET /api/buildings/{building}
     */
    public function show(Request $request, Building $building): JsonResponse
    {
        Gate::authorize('view', $building);

        $building->load('spaces.schedules');

        return response()->json(new BuildingResource($building));
    }

    /**
     * PUT/PATCH /api/buildings/{building}
     */
    public function update(UpdateBuildingRequest $request, Building $building): JsonResponse
    {
        Gate::authorize('update', $building);

        $data = $request->validated();

        if ($request->hasFile('floor_plan_image')) {
            // Eliminar imagen anterior si existe
            if ($building->floor_plan_image) {
                Storage::disk('public')->delete($building->floor_plan_image);
            }
            $data['floor_plan_image'] = $request->file('floor_plan_image')
                ->store('floor_plans', 'public');
        }

        $building->update($data);

        return response()->json(new BuildingResource($building));
    }

    /**
     * DELETE /api/buildings/{building}
     */
    public function destroy(Building $building): JsonResponse
    {
        Gate::authorize('delete', $building);

        if ($building->floor_plan_image) {
            Storage::disk('public')->delete($building->floor_plan_image);
        }

        $building->delete();

        return response()->json(['message' => 'Edificio eliminado correctamente.']);
    }
}
