<?php

namespace Tests;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Spatie\Permission\Models\Role;

abstract class TestCase extends BaseTestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Limpiar caché de permisos antes de cada test
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
    }

    // ── Helpers ──────────────────────────────────────────────

    protected function createRole(string $name): Role
    {
        return Role::firstOrCreate(['name' => $name]);
    }

    protected function createAdmin(array $overrides = []): User
    {
        $this->createRole('admin');
        $user = User::factory()->create($overrides);
        $user->assignRole('admin');
        return $user;
    }

    protected function createUser(array $overrides = []): User
    {
        $this->createRole('user');
        $user = User::factory()->create($overrides);
        $user->assignRole('user');
        return $user;
    }

    protected function actingAsUser(array $overrides = []): array
    {
        $user  = $this->createUser($overrides);
        $token = $user->createToken('test')->plainTextToken;
        return [$user, $token];
    }

    protected function actingAsAdmin(array $overrides = []): array
    {
        $user  = $this->createAdmin($overrides);
        $token = $user->createToken('test')->plainTextToken;
        return [$user, $token];
    }

    protected function bearerToken(string $token): array
    {
        return ['Authorization' => "Bearer {$token}", 'Accept' => 'application/json'];
    }

    protected function jsonHeaders(): array
    {
        return ['Accept' => 'application/json', 'Content-Type' => 'application/json'];
    }
}
