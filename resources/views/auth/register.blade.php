@extends('layouts.app')

@section('title', 'Crear Cuenta — MapBuilder')

@section('content')
<div class="min-h-screen flex items-center justify-center px-4 py-10"
     style="background: linear-gradient(135deg, #EFF6FF 0%, white 50%, #EFF6FF 100%)">

    <div class="w-full max-w-md flex flex-col gap-8">

        {{-- Logo + marca --}}
        <div class="flex flex-col items-center">
            <img src="/logo.png" width="64" height="64" alt="MapBuilder logo"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
            <div style="display:none"
                 class="h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600">
                <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                </svg>
            </div>
            <h2 class="mt-4 text-2xl font-bold text-gray-900 tracking-tight">MapBuilder</h2>
            <p class="text-sm text-gray-400 mt-1">Plataforma SaaS de Mapeo de Edificios</p>
        </div>

        {{-- Card --}}
        <div class="bg-white rounded-lg shadow-sm ring-1 ring-gray-200 p-8">
            <div class="mb-8">
                <h1 class="text-2xl font-bold text-gray-900">Crear Cuenta</h1>
                <p class="text-sm text-gray-500 mt-1">Regístrate para continuar</p>
            </div>

            @if ($errors->any())
                <div class="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                    {{ $errors->first() }}
                </div>
            @endif

            <form method="POST" action="{{ route('web.register') }}" class="space-y-5">
                @csrf

                {{-- Nombre --}}
                <div>
                    <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
                        Nombre Completo
                    </label>
                    <input id="name" name="name" type="text"
                           value="{{ old('name') }}"
                           autocomplete="name"
                           placeholder="Tu nombre completo"
                           class="w-full h-[46px] rounded-lg border px-4 text-base text-gray-900 placeholder:text-gray-400 outline-none transition
                                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                  {{ $errors->has('name') ? 'border-red-400' : 'border-gray-300' }}">
                    @error('name')
                        <p class="mt-1 text-xs text-red-600">{{ $message }}</p>
                    @enderror
                </div>

                {{-- Correo --}}
                <div>
                    <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                        Correo Electrónico
                    </label>
                    <input id="email" name="email" type="email"
                           value="{{ old('email') }}"
                           autocomplete="email"
                           placeholder="correo@ejemplo.com"
                           class="w-full h-[46px] rounded-lg border px-4 text-base text-gray-900 placeholder:text-gray-400 outline-none transition
                                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                  {{ $errors->has('email') ? 'border-red-400' : 'border-gray-300' }}">
                    @error('email')
                        <p class="mt-1 text-xs text-red-600">{{ $message }}</p>
                    @enderror
                </div>

                {{-- Contraseña --}}
                <div>
                    <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                        Contraseña
                    </label>
                    <input id="password" name="password" type="password"
                           autocomplete="new-password"
                           placeholder="••••••••"
                           class="w-full h-[46px] rounded-lg border px-4 text-base text-gray-900 placeholder:text-gray-400 outline-none transition
                                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                  {{ $errors->has('password') ? 'border-red-400' : 'border-gray-300' }}">
                    @error('password')
                        <p class="mt-1 text-xs text-red-600">{{ $message }}</p>
                    @enderror
                </div>

                {{-- Confirmar contraseña --}}
                <div>
                    <label for="password_confirmation" class="block text-sm font-medium text-gray-700 mb-2">
                        Confirmar Contraseña
                    </label>
                    <input id="password_confirmation" name="password_confirmation" type="password"
                           autocomplete="new-password"
                           placeholder="••••••••"
                           class="w-full h-[46px] rounded-lg border border-gray-300 px-4 text-base text-gray-900 placeholder:text-gray-400 outline-none transition
                                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                </div>

                {{-- Botón --}}
                <div class="pt-4">
                    <button type="submit"
                            class="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white text-base font-medium rounded-lg shadow-sm transition">
                        Crear Cuenta
                    </button>
                </div>

                <p class="text-center text-sm text-gray-500">
                    ¿Ya tienes cuenta?
                    <a href="{{ route('web.login') }}" class="font-medium text-blue-600 hover:underline">
                        Iniciar sesión
                    </a>
                </p>
            </form>
        </div>

    </div>
</div>
@endsection
