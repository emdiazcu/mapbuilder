<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Building;
use App\Models\Schedule;
use App\Models\Space;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class DashboardController extends Controller
{
    public function index(): View
    {
        $user = Auth::user();

        $isAdmin = $user->hasRole('admin');

        $buildingQuery = $isAdmin
            ? Building::query()
            : Building::ownedBy($user->id);

        $totalBuildings = (clone $buildingQuery)->count();

        $buildingIds = (clone $buildingQuery)->pluck('id');

        $totalSpaces = Space::whereIn('building_id', $buildingIds)->count();

        $totalSchedules = Schedule::whereHas('space', fn ($q) =>
            $q->whereIn('building_id', $buildingIds)
        )->where('is_active', true)->count();

        $lastActivity = (clone $buildingQuery)
            ->withCount('spaces')
            ->latest('updated_at')
            ->first();

        $recentBuildings = (clone $buildingQuery)
            ->withCount('spaces')
            ->latest('updated_at')
            ->limit(5)
            ->get();

        return view('dashboard.index', compact(
            'totalBuildings',
            'totalSpaces',
            'totalSchedules',
            'lastActivity',
            'recentBuildings'
        ));
    }

    public function maps(Request $request): View
    {
        $user    = Auth::user();
        $isAdmin = $user->hasRole('admin');

        $query = $isAdmin
            ? Building::query()
            : Building::ownedBy($user->id);

        $query->withCount('spaces');

        if ($search = $request->input('search')) {
            $query->search($search);
        }

        if ($type = $request->input('type')) {
            $query->byType($type);
        }

        $buildings = $query->latest('updated_at')->paginate(9);

        return view('dashboard.maps', compact('buildings'));
    }
}
