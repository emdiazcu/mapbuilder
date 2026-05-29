@extends('layouts.dashboard')

@section('title', 'Mis Mapas — MapBuilder')

@section('content')
<main class="p-8">
    <div class="mx-auto max-w-6xl space-y-6">

        {{-- Encabezado --}}
        <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
                <h1 class="text-2xl font-bold text-gray-900">Mis Mapas</h1>
                <p class="text-base text-gray-500 mt-1">{{ $buildings->total() }} edificios registrados</p>
            </div>
            <button class="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-base font-medium text-white shadow-sm hover:bg-blue-700">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                Crear Nuevo
            </button>
        </div>

        {{-- Filtros --}}
        <form method="GET" action="{{ route('web.maps') }}" class="flex flex-wrap items-center gap-3">
            <div class="relative flex-1 min-w-[200px] max-w-sm">
                <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input type="search" name="search" value="{{ request('search') }}"
                       placeholder="Buscar por nombre…"
                       class="h-10 w-full rounded-lg border border-gray-300 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
            </div>
            <select name="type" onchange="this.form.submit()"
                    class="h-10 rounded-lg border border-gray-300 px-3 text-sm text-gray-700 outline-none focus:border-blue-500">
                <option value="">Todos los tipos</option>
                <option value="school"     {{ request('type') === 'school'     ? 'selected' : '' }}>Escuela</option>
                <option value="commercial" {{ request('type') === 'commercial' ? 'selected' : '' }}>Comercial</option>
                <option value="office"     {{ request('type') === 'office'     ? 'selected' : '' }}>Oficina</option>
                <option value="dependency" {{ request('type') === 'dependency' ? 'selected' : '' }}>Dependencia</option>
            </select>
            @if(request('search') || request('type'))
                <a href="{{ route('web.maps') }}" class="text-sm text-gray-400 hover:text-gray-600">Limpiar</a>
            @endif
        </form>

        {{-- Grid de edificios --}}
        @if($buildings->isEmpty())
            <div class="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-16 text-center">
                <svg class="mb-3 h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
                </svg>
                <p class="text-base font-medium text-gray-600">No hay edificios aún</p>
                <p class="mt-1 text-sm text-gray-400">Crea tu primer mapa para empezar</p>
            </div>
        @else
            @php
                $gradients = [
                    'school'     => 'from-blue-400 to-blue-600',
                    'commercial' => 'from-purple-400 to-purple-700',
                    'office'     => 'from-green-400 to-green-600',
                    'dependency' => 'from-orange-400 to-orange-600',
                ];
                $typeLabels = [
                    'school'     => 'Escuela',
                    'commercial' => 'Comercial',
                    'office'     => 'Oficina',
                    'dependency' => 'Dependencia',
                ];
            @endphp

            <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                @foreach($buildings as $building)
                @php $gradient = $gradients[$building->type] ?? 'from-gray-400 to-gray-600'; @endphp
                <div class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">

                    {{-- Imagen / gradiente --}}
                    <div class="relative h-40 bg-gradient-to-br {{ $gradient }}">
                        <div class="absolute inset-0 flex items-center justify-center bg-black/10">
                            <svg class="h-12 w-12 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
                            </svg>
                        </div>
                        <button class="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-gray-600 hover:bg-white">
                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
                            </svg>
                        </button>
                    </div>

                    <div class="p-6">
                        <div class="flex items-start justify-between gap-3">
                            <h3 class="min-w-0 text-lg font-semibold text-gray-900 line-clamp-1">
                                {{ $building->name }}
                            </h3>
                            <span class="shrink-0 inline-flex rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                                {{ $typeLabels[$building->type] ?? $building->type }}
                            </span>
                        </div>

                        <div class="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500">
                            <span class="flex items-center gap-1.5">
                                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7"
                                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5"/>
                                </svg>
                                {{ $building->spaces_count }} espacios
                            </span>
                        </div>

                        <p class="mt-3 text-xs text-gray-400">
                            Actualizado {{ $building->updated_at->diffForHumans() }}
                        </p>

                        <div class="mt-4 flex gap-2">
                            <a href="{{ route('web.map.public', $building->public_token) }}"
                               class="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50">
                                Ver Mapa
                            </a>
                            <a href="{{ route('web.editor.edit', $building) }}"
                               class="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-blue-700">
                                Editar
                            </a>
                        </div>
                    </div>
                </div>
                @endforeach
            </div>

            {{-- Paginación --}}
            @if($buildings->lastPage() > 1)
            <div class="flex items-center justify-between pt-2">
                <p class="text-sm text-gray-500">
                    Mostrando {{ $buildings->firstItem() }}–{{ $buildings->lastItem() }} de {{ $buildings->total() }}
                </p>
                {{ $buildings->appends(request()->query())->links('vendor.pagination.simple-tailwind') }}
            </div>
            @endif
        @endif

    </div>
</main>
@endsection
