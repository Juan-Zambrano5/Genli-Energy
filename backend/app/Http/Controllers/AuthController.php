<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::firstOrCreate(
            ['email' => $request->email],
            ['name' => $request->name ?? 'Usuario', 'password' => bcrypt('password')] // Default password just in case
        );

        // Si es el primer usuario, lo hacemos admin por seguridad
        if (User::count() === 1 && !$user->hasRole('administrador')) {
            $user->assignRole('administrador');
        } elseif (!$user->hasAnyRole(['administrador', 'gerente', 'tecnico'])) {
            $user->assignRole('tecnico'); // Rol por defecto
        }

        return response()->json([
            'user' => $user,
            'roles' => $user->getRoleNames(),
            'permissions' => $user->getAllPermissions()->pluck('name')
        ]);
    }
}
