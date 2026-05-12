<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'ver registros',
            'crear registros',
            'editar registros',
            'eliminar registros',
            'ver estadisticas',
        ];

        foreach ($permissions as $permissionName) {
            Permission::firstOrCreate(['name' => $permissionName]);
        }

        $admin = Role::firstOrCreate(['name' => 'administrador']);
        $gerente = Role::firstOrCreate(['name' => 'gerente']);
        $tecnico = Role::firstOrCreate(['name' => 'tecnico']);

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
