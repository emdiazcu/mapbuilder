<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Building;
use App\Models\Space;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\View\View;

class MapEditorController extends Controller
{
    /** GET /editor — editor vacío para crear un edificio nuevo */
    public function create(): View
    {
        return view('editor.index', [
            'building'   => null,
            'spaces'     => collect(),
            'spacesData' => [],
        ]);
    }

    /** GET /editor/{building} — editor con un edificio existente */
    public function edit(Building $building): View
    {
        Gate::authorize('update', $building);

        $spaces = $building->spaces()
            ->with(['schedules' => fn ($q) => $q->orderBy('day_of_week')])
            ->get();

        // Serializar aquí para evitar que Blade intente parsear fn() dentro de @json()
        $spacesData = $spaces->map(fn ($s) => [
            'id'           => (string) $s->id,
            'name'         => $s->name,
            'type'         => $s->type,
            'color'        => $s->color,
            'polygon_data' => $s->polygon_data ?? [],
        ])->values()->all();

        return view('editor.index', [
            'building'   => $building,
            'spaces'     => $spaces,
            'spacesData' => $spacesData,
        ]);
    }

    /** POST /editor — guardar edificio nuevo + espacios dibujados */
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'type'        => 'required|in:school,commercial,office,dependency',
            'latitude'    => 'nullable|numeric',
            'longitude'   => 'nullable|numeric',
            'description' => 'nullable|string|max:1000',
            'spaces_json' => 'nullable|json',
        ]);

        $building = Building::create([
            'user_id'     => Auth::id(),
            'name'        => $data['name'],
            'type'        => $data['type'],
            'latitude'    => $data['latitude']    ?? null,
            'longitude'   => $data['longitude']   ?? null,
            'description' => $data['description'] ?? null,
        ]);

        $this->saveSpaces($building, $data['spaces_json'] ?? null);

        return redirect()->route('web.editor.edit', $building)
            ->with('success', 'Edificio creado correctamente.');
    }

    /** PUT /editor/{building} — actualizar edificio existente */
    public function update(Request $request, Building $building): RedirectResponse
    {
        Gate::authorize('update', $building);

        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'type'        => 'required|in:school,commercial,office,dependency',
            'latitude'    => 'nullable|numeric',
            'longitude'   => 'nullable|numeric',
            'description' => 'nullable|string|max:1000',
            'spaces_json' => 'nullable|json',
        ]);

        $building->update([
            'name'        => $data['name'],
            'type'        => $data['type'],
            'latitude'    => $data['latitude']    ?? null,
            'longitude'   => $data['longitude']   ?? null,
            'description' => $data['description'] ?? null,
        ]);

        // Reemplazar todos los espacios con los nuevos dibujados
        if (isset($data['spaces_json'])) {
            $building->spaces()->delete();
            $this->saveSpaces($building, $data['spaces_json']);
        }

        return redirect()->route('web.editor.edit', $building)
            ->with('success', 'Edificio actualizado correctamente.');
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private function saveSpaces(Building $building, ?string $spacesJson): void
    {
        if (!$spacesJson) return;

        $shapes = json_decode($spacesJson, true);
        if (!is_array($shapes)) return;

        foreach ($shapes as $i => $shape) {
            Space::create([
                'building_id'  => $building->id,
                'name'         => $shape['name']  ?? 'Espacio ' . ($i + 1),
                'type'         => $shape['type']  ?? 'classroom',
                'color'        => $shape['color'] ?? '#2563eb',
                'polygon_data' => $shape['latlngs'] ?? [],
            ]);
        }
    }
}
