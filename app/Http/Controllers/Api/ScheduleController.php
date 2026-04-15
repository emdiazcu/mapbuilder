<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreScheduleRequest;
use App\Http\Requests\UpdateScheduleRequest;
use App\Http\Resources\ScheduleResource;
use App\Models\Schedule;
use App\Models\Space;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class ScheduleController extends Controller
{
    /**
     * GET /api/spaces/{space}/schedules
     */
    public function index(Space $space): AnonymousResourceCollection
    {
        Gate::authorize('view', $space->building);

        $schedules = $space->schedules()
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get();

        return ScheduleResource::collection($schedules);
    }

    /**
     * POST /api/spaces/{space}/schedules
     */
    public function store(StoreScheduleRequest $request, Space $space): JsonResponse
    {
        Gate::authorize('update', $space->building);

        $schedule = $space->schedules()->create($request->validated());

        return response()->json(new ScheduleResource($schedule), 201);
    }

    /**
     * GET /api/schedules/{schedule}  (shallow)
     */
    public function show(Schedule $schedule): JsonResponse
    {
        Gate::authorize('view', $schedule->space->building);

        return response()->json(new ScheduleResource($schedule));
    }

    /**
     * PUT/PATCH /api/schedules/{schedule}  (shallow)
     */
    public function update(UpdateScheduleRequest $request, Schedule $schedule): JsonResponse
    {
        Gate::authorize('update', $schedule->space->building);

        $schedule->update($request->validated());

        return response()->json(new ScheduleResource($schedule));
    }

    /**
     * DELETE /api/schedules/{schedule}  (shallow)
     */
    public function destroy(Schedule $schedule): JsonResponse
    {
        Gate::authorize('delete', $schedule->space->building);

        $schedule->delete();

        return response()->json(['message' => 'Horario eliminado correctamente.']);
    }
}
