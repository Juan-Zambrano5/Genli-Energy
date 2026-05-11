<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Limpiar caché de permisos
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Crear permisos
        Permission::create(['name' => 'ver registros']);
        Permission::create(['name' => 'crear registros']);
        Permission::create(['name' => 'editar registros']);
        Permission::create(['name' => 'eliminar registros']);
        Permission::create(['name' => 'ver estadisticas']);

        // Crear roles
        $admin = Role::create(['name' => 'administrador']);
        $gerente = Role::create(['name' => 'gerente']);
        $tecnico = Role::create(['name' => 'tecnico']);

        // Asignar permisos
        $admin->givePermissionTo(Permission::all());

        $gerente->givePermissionTo([
            'ver registros',
            'crear registros',
            'editar registros',
            'ver estadisticas'
        ]);

        $tecnico->givePermissionTo([
            'ver registros',
            'crear registros'
        ]);
    }
}
