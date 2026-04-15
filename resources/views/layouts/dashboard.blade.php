<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'MapBuilder')</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="antialiased bg-white">

<div class="flex min-h-screen">

    {{-- Sidebar --}}
    <aside class="flex w-72 shrink-0 flex-col border-r border-gray-200 bg-white">

        {{-- Logo --}}
        <div class="border-b border-gray-200 px-6 py-6">
            <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700">
                    <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                </div>
                <div>
                    <p class="text-lg font-bold text-gray-900">MapBuilder</p>
                    <p class="text-xs text-gray-400">SaaS Platform</p>
                </div>
            </div>
        </div>

        {{-- Nav --}}
        <nav class="flex flex-1 flex-col gap-1 overflow-auto px-4 py-6">
            <a href="{{ route('web.dashboard') }}"
               class="flex h-12 items-center gap-3 rounded-lg px-4 text-base transition-colors
                      {{ request()->routeIs('web.dashboard') ? 'bg-blue-50 font-medium text-blue-600' : 'text-gray-700 hover:bg-gray-50' }}">
                <svg class="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7"
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                </svg>
                Inicio
            </a>
            <a href="{{ route('web.maps') }}"
               class="flex h-12 items-center gap-3 rounded-lg px-4 text-base transition-colors
                      {{ request()->routeIs('web.maps') ? 'bg-blue-50 font-medium text-blue-600' : 'text-gray-700 hover:bg-gray-50' }}">
                <svg class="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7"
                          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
                </svg>
                Mis Mapas
            </a>
            <button class="flex h-12 items-center gap-3 rounded-lg px-4 text-base text-gray-700 hover:bg-gray-50">
                <svg class="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" d="M12 4v16m8-8H4"/>
                </svg>
                Crear Mapa
            </button>
            <button class="flex h-12 items-center gap-3 rounded-lg px-4 text-base text-gray-700 hover:bg-gray-50">
                <svg class="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7"
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
                Reportes
            </button>
            <button class="flex h-12 items-center gap-3 rounded-lg px-4 text-base text-gray-700 hover:bg-gray-50">
                <svg class="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7"
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                </svg>
                Exportar
            </button>
        </nav>

        <div class="border-t border-gray-200 px-6 py-4">
            <p class="text-center text-xs text-gray-400">© {{ date('Y') }} MapBuilder SaaS</p>
        </div>
    </aside>

    {{-- Contenido principal --}}
    <div class="flex min-w-0 flex-1 flex-col">

        {{-- Header --}}
        <header class="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
            <div class="relative max-w-xl flex-1">
                <svg class="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input type="search" placeholder="Buscar mapas, edificios..."
                       class="h-11 w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-base text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
            </div>

            <div class="flex items-center gap-3 pl-4">
                {{-- Notificaciones --}}
                <button class="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7"
                              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                    </svg>
                    <span class="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>
                </button>

                {{-- Usuario --}}
                <div class="relative" x-data="{ open: false }">
                    <button @click="open = !open"
                            class="flex items-center gap-3 rounded-lg py-1 pl-3 pr-2 hover:bg-gray-50">
                        <div class="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-xs font-medium text-white">
                            {{ strtoupper(substr(auth()->user()->name ?? 'U', 0, 2)) }}
                        </div>
                        <div class="hidden text-left sm:block">
                            <p class="text-sm font-medium text-gray-900">{{ auth()->user()->name ?? 'Usuario' }}</p>
                            <p class="text-xs text-gray-400">{{ auth()->user()->getRoleNames()->first() ?? 'user' }}</p>
                        </div>
                        <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                        </svg>
                    </button>

                    <div x-show="open" @click.outside="open = false"
                         class="absolute right-0 top-full z-20 mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                        <form method="POST" action="{{ route('logout') }}">
                            @csrf
                            <button type="submit"
                                    class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
                                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                                </svg>
                                Cerrar sesión
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </header>

        <div class="flex-1 overflow-auto bg-gray-50">
            @yield('content')
        </div>
    </div>
</div>

<script src="//unpkg.com/alpinejs" defer></script>
</body>
</html>
