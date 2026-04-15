<?php

namespace Tests\Unit;

use App\Models\Building;
use App\Policies\BuildingPolicy;
use Tests\TestCase;

class BuildingPolicyTest extends TestCase
{
    private BuildingPolicy $policy;

    protected function setUp(): void
    {
        parent::setUp();
        $this->policy = new BuildingPolicy();
    }

    // ── Test 1: Owner puede ver su propio edificio ────────────

    public function test_owner_can_view_own_building(): void
    {
        $user     = $this->createUser();
        $building = Building::factory()->create(['user_id' => $user->id]);

        $this->assertTrue($this->policy->view($user, $building));
    }

    // ── Test 2: Usuario ajeno no puede ver edificio de otro ───

    public function test_user_cannot_view_other_users_building(): void
    {
        $userA    = $this->createUser();
        $userB    = $this->createUser();
        $building = Building::factory()->create(['user_id' => $userA->id]);

        $this->assertFalse($this->policy->view($userB, $building));
    }

    // ── Test 3: Admin puede ver cualquier edificio ────────────

    public function test_admin_can_view_any_building(): void
    {
        $admin    = $this->createAdmin();
        $user     = $this->createUser();
        $building = Building::factory()->create(['user_id' => $user->id]);

        $this->assertTrue($this->policy->view($admin, $building));
    }

    // ── Test 4: Owner puede editar su propio edificio ─────────

    public function test_owner_can_update_own_building(): void
    {
        $user     = $this->createUser();
        $building = Building::factory()->create(['user_id' => $user->id]);

        $this->assertTrue($this->policy->update($user, $building));
    }

    // ── Test 5: Usuario ajeno no puede editar edificio de otro

    public function test_user_cannot_update_other_users_building(): void
    {
        $userA    = $this->createUser();
        $userB    = $this->createUser();
        $building = Building::factory()->create(['user_id' => $userA->id]);

        $this->assertFalse($this->policy->update($userB, $building));
    }

    // ── Test 6: Admin puede eliminar cualquier edificio ───────

    public function test_admin_can_delete_any_building(): void
    {
        $admin    = $this->createAdmin();
        $user     = $this->createUser();
        $building = Building::factory()->create(['user_id' => $user->id]);

        $this->assertTrue($this->policy->delete($admin, $building));
    }
}
