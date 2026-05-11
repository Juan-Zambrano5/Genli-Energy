<?php

use App\Http\Controllers\GenlienergyController;
use App\Models\Genlienergy;
use Illuminate\Support\Facades\Route;

Route::get('/', function () { $total = Genlienergy::count();

    return view('welcome', compact('total'));
})->name('welcome');

Route::get('/registros', [GenlienergyController::class, 'index'])->name('index');

Route::get('/registro/crear', [GenlienergyController::class, 'create'])->name('create');
Route::post('/registro/guardar', [GenlienergyController::class, 'store'])->name('store');
Route::get('/registro/{id}', [GenlienergyController::class, 'show'])->name('show');
Route::get('/registro/{id}/editar', [GenlienergyController::class, 'edit'])->name('edit');
Route::put('/registro/{id}/actualizar', [GenlienergyController::class, 'update'])->name('update');
Route::get('/registro/{id}/eliminar', [GenlienergyController::class, 'confirmDestroy'])->name('destroy.confirm');
Route::delete('/registro/{id}', [GenlienergyController::class, 'destroy'])->name('destroy');
Route::get('/registro/{id}/reporte', [GenlienergyController::class, 'generarReporte'])->name('reporte.pdf');
