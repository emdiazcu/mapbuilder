<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@mapbuilder.app'],
            [
                'name'     => 'Administrador',
                'password' => Hash::make('password'),
            ]
        );
        $admin->assignRole('admin');

        $users = [
            ['name' => 'Juan Pérez',    'email' => 'juan@example.com'],
            ['name' => 'María García',  'email' => 'maria@example.com'],
            ['name' => 'Carlos López',  'email' => 'carlos@example.com'],
        ];

        foreach ($users as $data) {
            $user = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'name'     => $data['name'],
                    'password' => Hash::make('password'),
                ]
            );
            $user->assignRole('user');
        }
    }
}
