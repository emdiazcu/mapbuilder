<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $building->name }} — MapBuilder</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link  rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
        html, body { height: 100%; margin: 0; padding: 0; }
        #map { height: 100%; width: 100%; }
    </style>
</head>
<body class="flex h-screen flex-col bg-white">

{{-- ── Header ──────────────────────────────────────────────────────── --}}
<header class="flex h-14 shrink-0 items-center gap-4 border-b border-gray-200 bg-white px-4">
    @auth
        <a href="{{ route('web.maps') }}"
           class="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
           title="Volver">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7"
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
        </a>
    @endauth

    <div>
        <p class="text-base font-semibold text-gray-900 leading-5">{{ $building->name }}</p>
        <p class="text-xs text-gray-400">
            {{ __('types.' . $building->type) }}
            @if($building->latitude && $building->longitude)
                · {{ $building->latitude }}, {{ $building->longitude }}
            @endif
        </p>
    </div>

    @auth
        <div class="ml-auto">
            <a href="{{ route('web.editor.edit', $building) }}"
               class="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                Editar
            </a>
        </div>
    @endauth
</header>

{{-- ── Body ─────────────────────────────────────────────────────────── --}}
<div class="flex min-h-0 flex-1">

    {{-- Mapa --}}
    <div class="relative flex-1 overflow-hidden">
        <div id="map"></div>
    </div>

    {{-- Sidebar de información --}}
    <aside class="flex w-72 shrink-0 flex-col overflow-y-auto border-l border-gray-200 bg-white">

        <div class="border-b border-gray-200 px-5 py-4">
            <h2 class="text-base font-semibold text-gray-900">{{ $building->name }}</h2>
            <span class="mt-1 inline-flex rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                {{ __('types.' . $building->type) }}
            </span>
        </div>

        <div class="flex flex-col gap-4 px-5 py-5">

            @if($building->description)
                <p class="text-sm text-gray-600">{{ $building->description }}</p>
            @endif

            @if($building->latitude || $building->longitude)
                <div class="flex items-start gap-2 text-sm text-gray-500">
                    <svg class="mt-0.5 h-4 w-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7"
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    <span>{{ $building->latitude }}, {{ $building->longitude }}</span>
                </div>
            @endif

            {{-- Espacios --}}
            @if($building->spaces->count() > 0)
                <div class="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7"
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5"/>
                    </svg>
                    {{ $building->spaces->count() }} espacio{{ $building->spaces->count() !== 1 ? 's' : '' }}
                </div>

                @foreach($building->spaces as $space)
                    <div class="rounded-lg border border-gray-200 p-3">
                        <p class="text-sm font-medium text-gray-900">{{ $space->name }}</p>
                        <p class="text-xs text-gray-400">{{ $space->type }}</p>

                        @if($space->schedules->count() > 0)
                            <div class="mt-2 flex flex-col gap-0.5">
                                @php
                                    $days = [0=>'Dom',1=>'Lun',2=>'Mar',3=>'Mié',4=>'Jue',5=>'Vie',6=>'Sáb'];
                                @endphp
                                @foreach($space->schedules as $sched)
                                    <div class="flex items-center gap-1.5 text-xs text-gray-500">
                                        <svg class="h-3 w-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7"
                                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                        </svg>
                                        <span>{{ $days[$sched->day_of_week] ?? '' }}: {{ substr($sched->start_time, 0, 5) }} – {{ substr($sched->end_time, 0, 5) }}</span>
                                    </div>
                                @endforeach
                            </div>
                        @endif
                    </div>
                @endforeach
            @else
                <p class="text-sm text-gray-400">Este edificio aún no tiene espacios registrados.</p>
            @endif

        </div>
    </aside>
</div>

<script>
(function () {
    @php
        $lat = $building->latitude  ?? 19.4326;
        $lng = $building->longitude ?? -99.1332;

        // Si no hay coordenadas pero hay espacios, usar el primer punto
        if (!$building->latitude && $building->spaces->count()) {
            $firstPoint = $building->spaces->first()?->polygon_data[0] ?? null;
            if ($firstPoint) { $lat = $firstPoint['x']; $lng = $firstPoint['y']; }
        }
    @endphp

    const map = L.map('map').setView([{{ $lat }}, {{ $lng }}], 17)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 22,
    }).addTo(map)

    const spaces = @json($spacesData)

    spaces.forEach(space => {
        if (!space.polygon_data || space.polygon_data.length === 0) return

        const positions = space.polygon_data.map(p => [p.x, p.y])
        const color     = space.color || '#2563eb'

        const layer = positions.length >= 3
            ? L.polygon(positions,  { color, fillColor: color, fillOpacity: 0.2, weight: 2 })
            : L.polyline(positions, { color, weight: 3 })

        layer.addTo(map)

        layer.bindPopup(`
            <div style="min-width:160px">
                <p style="font-weight:600;color:#111">${space.name}</p>
                <p style="font-size:12px;color:#6b7280;margin-top:2px">${space.type}</p>
            </div>
        `)
    })
})()
</script>
</body>
</html>
