<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index()
    {
        // Verificación temporal - permitir acceso si el email está en el header
        $email = request()->header('X-User-Email');
        if (!$email) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $users = User::with('roles')->get();
        $roles = Role::all();
        
        return response()->json([
            'users' => $users,
            'roles' => $roles
        ]);
    }

    public function store(Request $request)
    {
        $email = request()->header('X-User-Email');
        if (!$email) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|exists:roles,name'
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password)
        ]);

        $user->assignRole($request->role);

        return response()->json([
            'message' => 'Usuario creado correctamente',
            'user' => $user->load('roles')
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $email = request()->header('X-User-Email');
        if (!$email) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $user = User::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $id,
            'role' => 'required|exists:roles,name'
        ]);

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
        ]);

        if ($request->password) {
            $user->update([
                'password' => Hash::make($request->password)
            ]);
        }

        $user->syncRoles([$request->role]);

        return response()->json([
            'message' => 'Usuario actualizado correctamente',
            'user' => $user->load('roles')
        ]);
    }

    public function destroy($id)
    {
        $email = request()->header('X-User-Email');
        if (!$email) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $user = User::findOrFail($id);
        
        // No permitir que el usuario se elimine a sí mismo
        $currentUser = auth()->user();
        if ($currentUser && $currentUser->id == $id) {
            return response()->json([
                'error' => 'No puedes eliminar tu propia cuenta'
            ], 422);
        }

        $user->delete();

        return response()->json([
            'message' => 'Usuario eliminado correctamente'
        ]);
    }
}