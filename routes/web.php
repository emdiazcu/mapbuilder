<?php

use App\Http\Controllers\Web\AuthController;
use App\Http\Controllers\Web\DashboardController;
use App\Http\Controllers\Web\MapEditorController;
use App\Http\Controllers\Web\PublicMapController;
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

// ── Público (sin auth) ────────────────────────────────────────
Route::get('/map/{token}', [PublicMapController::class, 'show'])->name('web.map.public');

// ── Autenticado ───────────────────────────────────────────────
Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('web.dashboard');
    Route::get('/maps',      [DashboardController::class, 'maps'])->name('web.maps');

    // Editor de mapas
    Route::get('/editor',                    [MapEditorController::class, 'create'])->name('web.editor.create');
    Route::post('/editor',                   [MapEditorController::class, 'store'])->name('web.editor.store');
    Route::get('/editor/{building}',         [MapEditorController::class, 'edit'])->name('web.editor.edit');
    Route::put('/editor/{building}',         [MapEditorController::class, 'update'])->name('web.editor.update');

    // Exportar Excel (reutiliza controlador API)
    Route::get('/buildings/{building}/export', [ExportController::class, 'exportExcel'])
        ->name('buildings.export');
});

require __DIR__.'/auth.php';
