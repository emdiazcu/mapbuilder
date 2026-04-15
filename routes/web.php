<?php

use App\Http\Controllers\Web\AuthController;
use App\Http\Controllers\Web\DashboardController;
use App\Http\Controllers\Api\ExportController;
use Illuminate\Support\Facades\Route;

// Raíz → dashboard si autenticado, si no login
Route::get('/', fn () => redirect()->route(
    auth()->check() ? 'web.dashboard' : 'web.login'
));

// ── Auth (guest) ─────────────────────────────────────────────
Route::middleware('guest')->group(function () {
    Route::get('/login',    [AuthController::class, 'loginForm'])->name('web.login');
    Route::post('/login',   [AuthController::class, 'login']);

    Route::get('/register', [AuthController::class, 'registerForm'])->name('web.register');
    Route::post('/register',[AuthController::class, 'register']);
});

// ── Autenticado ───────────────────────────────────────────────
Route::middleware('auth')->group(function () {
    Route::get('/dashboard',           [DashboardController::class, 'index'])->name('web.dashboard');
    Route::get('/maps',                [DashboardController::class, 'maps'])->name('web.maps');

    // Exportar Excel desde la vista Blade (reutiliza el mismo controlador API)
    Route::get('/buildings/{building}/export', [ExportController::class, 'exportExcel'])
        ->name('buildings.export');
});

require __DIR__.'/auth.php';
