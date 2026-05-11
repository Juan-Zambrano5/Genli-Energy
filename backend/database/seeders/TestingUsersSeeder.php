<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TestingUsersSeeder extends Seeder
{
    public function run(): void
    {
        // Administrador
        $admin = User::firstOrCreate(
            ['email' => 'jumizambrano123@umariana.edu.co'],
            ['name' => 'administrador', 'password' => Hash::make('password')]
        );
        $admin->assignRole('administrador');

        // Gerente
        $gerente = User::firstOrCreate(
            ['email' => 'juanmiguelzambrano2006@gmail.com'],
            ['name' => 'gerente', 'password' => Hash::make('password')]
        );
        $gerente->assignRole('gerente');

        // Técnico
        $tecnico = User::firstOrCreate(
            ['email' => 'jz284561@gmail.com'],
            ['name' => 'tecnico', 'password' => Hash::make('password')]
        );
        $tecnico->assignRole('tecnico');
    }
}
