<?php

namespace Tests\Unit;

use Database\Seeders\RoleSeeder;
use Tests\TestCase;

class RolePermissionTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleSeeder::class);
    }

    // ── Test 1: Usuario recibe rol 'user' al crearse ──────────

    public function test_created_user_has_user_role(): void
    {
        $user = $this->createUser();

        $this->assertTrue($user->hasRole('user'));
        $this->assertFalse($user->hasRole('admin'));
    }

    // ── Test 2: Admin recibe rol 'admin' ──────────────────────

    public function test_created_admin_has_admin_role(): void
    {
        $admin = $this->createAdmin();

        $this->assertTrue($admin->hasRole('admin'));
        $this->assertFalse($admin->hasRole('user'));
    }

    // ── Test 3: Usuario tiene permiso 'create buildings' ──────

    public function test_user_has_permission_to_create_buildings(): void
    {
        $user = $this->createUser();

        $this->assertTrue($user->can('create buildings'));
    }

    // ── Test 4: Usuario no tiene permiso de admin ─────────────

    public function test_user_does_not_have_admin_only_permission(): void
    {
        $user = $this->createUser();

        // 'manage users' es exclusivo de admin
        $this->assertFalse($user->can('manage users'));
    }

    // ── Test 5: Admin tiene todos los permisos ────────────────

    public function test_admin_has_all_permissions(): void
    {
        $admin = $this->createAdmin();

        $this->assertTrue($admin->can('create buildings'));
        $this->assertTrue($admin->can('manage users'));
        $this->assertTrue($admin->can('view buildings'));
    }

    // ── Test 6: Usuario tiene permisos básicos de CRUD ────────

    public function test_user_has_basic_crud_permissions(): void
    {
        $user = $this->createUser();

        $this->assertTrue($user->can('view buildings'));
        $this->assertTrue($user->can('create buildings'));
        $this->assertTrue($user->can('edit buildings'));
        $this->assertTrue($user->can('delete buildings'));
    }
}
