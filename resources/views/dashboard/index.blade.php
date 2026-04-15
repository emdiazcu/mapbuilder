@extends('layouts.dashboard')

@section('title', 'Dashboard — MapBuilder')

@section('content')
<main class="p-8">
    <div class="mx-auto max-w-6xl space-y-8">

        {{-- Encabezado --}}
        <div>
            <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p class="mt-2 text-base text-gray-500">
                Bienvenido de nuevo, {{ explode(' ', auth()->user()->name)[0] }}
            </p>
        </div>

        {{-- Stats --}}
        <div class="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">

            <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div class="flex items-start justify-between gap-4">
                    <div class="space-y-1">
                        <p class="text-sm text-gray-500">Total Edificios</p>
                        <p class="text-3xl font-bold text-gray-900">{{ $totalBuildings }}</p>
                        <p class="text-sm text-green-600">en tu cuenta</p>
                    </div>
                    <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                        <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        </svg>
                    </div>
                </div>
            </div>

            <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div class="flex items-start justify-between gap-4">
                    <div class="space-y-1">
                        <p class="text-sm text-gray-500">Total Espacios</p>
                        <p class="text-3xl font-bold text-gray-900">{{ $totalSpaces }}</p>
                        <p class="text-sm text-green-600">registrados</p>
                    </div>
                    <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-green-100">
                        <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                        </svg>
                    </div>
                </div>
            </div>

            <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div class="flex items-start justify-between gap-4">
                    <div class="space-y-1">
                        <p class="text-sm text-gray-500">Horarios Activos</p>
                        <p class="text-3xl font-bold text-gray-900">{{ $totalSchedules }}</p>
                        <p class="text-sm text-green-600">en total</p>
                    </div>
                    <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-purple-100">
                        <svg class="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    </div>
                </div>
            </div>

            <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div class="flex items-start justify-between gap-4">
                    <div class="space-y-1">
                        <p class="text-sm text-gray-500">Última Actividad</p>
                        <p class="text-3xl font-bold text-gray-900">
                            {{ $lastActivity ? $lastActivity->updated_at->format('H:i') : '—' }}
                        </p>
                        <p class="text-sm text-gray-400">
                            {{ $lastActivity ? $lastActivity->updated_at->diffForHumans() : 'Sin actividad' }}
                        </p>
                    </div>
                    <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-orange-100">
                        <svg class="h-6 w-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    </div>
                </div>
            </div>

        </div>

        {{-- Tabla edificios recientes --}}
        <section class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div class="mb-6 flex items-center justify-between">
                <h2 class="text-xl font-bold text-gray-900">Edificios Recientes</h2>
                <a href="{{ route('web.maps') }}" class="text-sm text-blue-600 hover:underline">Ver todos</a>
            </div>

            @if($recentBuildings->isEmpty())
                <p class="py-4 text-center text-sm text-gray-400">No hay edificios aún. ¡Crea el primero!</p>
            @else
                <div class="overflow-x-auto -mx-6">
                    <table class="w-full min-w-[640px] text-left text-sm">
                        <thead>
                            <tr class="border-b border-gray-200">
                                <th class="px-6 py-3 font-medium text-gray-700">Nombre</th>
                                <th class="px-6 py-3 font-medium text-gray-700">Tipo</th>
                                <th class="px-6 py-3 font-medium text-gray-700">Espacios</th>
                                <th class="px-6 py-3 font-medium text-gray-700">Actualizado</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($recentBuildings as $building)
                            <tr class="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                                <td class="px-6 py-4 font-medium text-gray-900">{{ $building->name }}</td>
                                <td class="px-6 py-4">
                                    <span class="inline-flex rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                                        {{ __('types.' . $building->type) }}
                                    </span>
                                </td>
                                <td class="px-6 py-4 text-gray-600">{{ $building->spaces_count }}</td>
                                <td class="px-6 py-4 text-gray-400">{{ $building->updated_at->diffForHumans() }}</td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            @endif
        </section>

    </div>
</main>
@endsection
