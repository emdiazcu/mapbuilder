<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BuildingController;
use App\Http\Controllers\Api\ExportController;
use App\Http\Controllers\Api\PublicMapController;
use App\Http\Controllers\Api\ScheduleController;
use App\Http\Controllers\Api\SpaceController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Auth — sin token (registro y login devuelven Bearer token)
|--------------------------------------------------------------------------
*/
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login',    [AuthController::class, 'login']);
});

/*
|--------------------------------------------------------------------------
| Rutas públicas (sin autenticación)
|--------------------------------------------------------------------------
*/
Route::get('/maps/{token}/public', [PublicMapController::class, 'show']);

/*
|--------------------------------------------------------------------------
| Rutas autenticadas
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    // Auth protegida
    Route::prefix('auth')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me',      [AuthController::class, 'me']);
    });

    // Buildings CRUD + búsqueda paginada
    Route::apiResource('buildings', BuildingController::class);

    // Export y QR (anidados bajo buildings)
    Route::get('buildings/{building}/export', [ExportController::class, 'exportExcel']);
    Route::get('buildings/{building}/qr',     [ExportController::class, 'qrCode']);

    // Spaces anidados bajo buildings
    Route::apiResource('buildings.spaces', SpaceController::class)
        ->shallow();

    // Schedules anidados bajo spaces
    Route::apiResource('spaces.schedules', ScheduleController::class)
        ->shallow();
});
