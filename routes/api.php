<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\VacheController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Routes pour l'ESP32 et l'application DIAMA
Route::prefix('vaches')->group(function () {
    // Route pour recevoir les données ESP32
    Route::post('/update', [VacheController::class, 'updateFromESP32']);
    
    // Routes pour l'application web
    Route::get('/', [VacheController::class, 'index']);
    Route::post('/', [VacheController::class, 'store']); // Créer
    Route::get('/stats', [VacheController::class, 'stats']);
    Route::get('/{id}', [VacheController::class, 'show']);
    Route::put('/{id}', [VacheController::class, 'update']); // Modifier
    Route::delete('/{id}', [VacheController::class, 'destroy']);
});

// Route de santé du système
Route::get('/health', [VacheController::class, 'health']);
