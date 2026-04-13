<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSpaceRequest;
use App\Http\Requests\UpdateSpaceRequest;
use App\Http\Resources\SpaceResource;
use App\Models\Building;
use App\Models\Space;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class SpaceController extends Controller
{
    /**
     * GET /api/buildings/{building}/spaces
     */
    public function index(Request $request, Building $building): AnonymousResourceCollection
    {
        Gate::authorize('view', $building);

        $query = $building->spaces()->with('schedules');

        if ($search = $request->input('search')) {
            $query->search($search);
        }

        $spaces = $query->orderBy('name')->get();

        return SpaceResource::collection($spaces);
    }

    /**
     * POST /api/buildings/{building}/spaces
     */
    public function store(StoreSpaceRequest $request, Building $building): JsonResponse
    {
        Gate::authorize('update', $building);

        $space = $building->spaces()->create($request->validated());

        return response()->json(new SpaceResource($space), 201);
    }

    /**
     * GET /api/buildings/{building}/spaces/{space}
     */
    public function show(Building $building, Space $space): JsonResponse
    {
        Gate::authorize('view', $building);
        abort_if($space->building_id !== $building->id, 404);

        $space->load('schedules');

        return response()->json(new SpaceResource($space));
    }

    /**
     * PUT/PATCH /api/buildings/{building}/spaces/{space}
     */
    public function update(UpdateSpaceRequest $request, Building $building, Space $space): JsonResponse
    {
        Gate::authorize('update', $building);
        abort_if($space->building_id !== $building->id, 404);

        $space->update($request->validated());

        return response()->json(new SpaceResource($space));
    }

    /**
     * DELETE /api/buildings/{building}/spaces/{space}
     */
    public function destroy(Building $building, Space $space): JsonResponse
    {
        Gate::authorize('delete', $building);
        abort_if($space->building_id !== $building->id, 404);

        $space->delete();

        return response()->json(['message' => 'Espacio eliminado correctamente.']);
    }
}
