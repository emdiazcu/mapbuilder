<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // Limpiar cache de permisos antes de crear
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'view buildings',
            'create buildings',
            'edit buildings',
            'delete buildings',
            'view all buildings',
            'export data',
            'manage users',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        $admin = Role::firstOrCreate(['name' => 'admin']);
        $admin->syncPermissions(Permission::all());

        $user = Role::firstOrCreate(['name' => 'user']);
        $user->syncPermissions([
            'view buildings',
            'create buildings',
            'edit buildings',
            'delete buildings',
            'export data',
        ]);
    }
}
