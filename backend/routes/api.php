<?php

use App\Http\Controllers\GenlienergyController;
use App\Models\Barrio;
use App\Models\Genlienergy;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

// Auth Route
Route::post('/auth/login', [App\Http\Controllers\AuthController::class, 'login']);

// Routes accessible by any authenticated user
Route::middleware(['identify'])->group(function () {
    
    // 1. Obtener todos los registros (Todos)
    Route::get('/registros', function () {
        return response()->json(Genlienergy::all());
    });

    // 2. Obtener un registro específico (Todos)
    Route::get('/registros/{id}', function ($id) {
        return response()->json(Genlienergy::findOrFail($id));
    });

    // 3. Guardar nuevo registro (Todos pueden crear)
    Route::post('/registros', function (Request $request) {
        $data = $request->all();
        $user = auth()->user();
        if ($user) {
            $data['usuario'] = $user->name;
            $data['rol'] = $user->roles->first()?->name ?? 'tecnico';
        }
        $nuevo = Genlienergy::create($data);
        return response()->json($nuevo, 201);
    });

    // 4. Ruta para los barrios (Todos)
    Route::get('/barrios', function () {
        $maestros = Barrio::pluck('nombre')->toArray();
        $reportados = Genlienergy::distinct()->pluck('barrio')->toArray();
        $todos = array_unique(array_merge($maestros, $reportados));
        sort($todos);
        return response()->json(array_values($todos));
    });
});

// Routes accessible by Gerente and Administrador
Route::middleware(['identify'])->group(function () {
    // 6. Análisis stats (el rol se verifica en el controlador)
    Route::get('/analisis-stats', [App\Http\Controllers\GenlienergyController::class, 'getStats']);
    
    // Dashboard stats - datos para el dashboard completo
    Route::get('/dashboard-stats', [App\Http\Controllers\GenlienergyController::class, 'getDashboardStats']);
});

// Routes accessible only by Administrador
Route::middleware(['identify'])->group(function () {
    // 4. Actualizar registro (Admin y Gerente)
    Route::put('/registros/{id}', function (Request $request, $id) {
        $registro = Genlienergy::findOrFail($id);
        $user = auth()->user();
        $data = $request->all();
        if ($user) {
            $data['usuario'] = $user->name;
            $data['rol'] = $user->roles->first()?->name ?? 'tecnico';
        }
        $data['fecha'] = now();
        $registro->update($data);
        return response()->json($registro);
    });

    // 5. Eliminar registro (Solo admin)
    Route::delete('/registros/{id}', function ($id) {
        Genlienergy::findOrFail($id)->delete();
        return response()->json(['message' => 'Eliminado']);
    });
});

// Rutas de Usuarios - No necesitan middleware identify extra, el header se envía en cada petición
Route::get('/users', [App\Http\Controllers\UserController::class, 'index']);
Route::post('/users', [App\Http\Controllers\UserController::class, 'store']);
Route::put('/users/{id}', [App\Http\Controllers\UserController::class, 'update']);
Route::delete('/users/{id}', [App\Http\Controllers\UserController::class, 'destroy']);

Route::get('/reporte-pdf/{id}', [GenlienergyController::class, 'generarPDF']);
