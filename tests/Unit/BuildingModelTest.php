<?php

namespace Tests\Unit;

use App\Models\Building;
use App\Models\Space;
use App\Models\User;
use Tests\TestCase;

class BuildingModelTest extends TestCase
{
    // ── Test 1: public_token se genera automáticamente ────────

    public function test_public_token_is_generated_on_creation(): void
    {
        $user     = $this->createUser();
        $building = Building::factory()->create(['user_id' => $user->id]);

        $this->assertNotNull($building->public_token);
        $this->assertMatchesRegularExpression(
            '/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/',
            $building->public_token
        );
    }

    // ── Test 2: Relación con User ─────────────────────────────

    public function test_building_belongs_to_user(): void
    {
        $user     = $this->createUser();
        $building = Building::factory()->create(['user_id' => $user->id]);

        $this->assertInstanceOf(User::class, $building->user);
        $this->assertEquals($user->id, $building->user->id);
    }

    // ── Test 3: Relación con Spaces ───────────────────────────

    public function test_building_has_many_spaces(): void
    {
        $user     = $this->createUser();
        $building = Building::factory()->create(['user_id' => $user->id]);

        Space::factory(3)->create(['building_id' => $building->id]);

        $this->assertCount(3, $building->spaces);
    }

    // ── Test 4: Scope byType filtra por tipo ──────────────────

    public function test_scope_by_type_filters_correctly(): void
    {
        $user = $this->createUser();

        Building::factory(2)->school()->create(['user_id' => $user->id]);
        Building::factory(3)->office()->create(['user_id' => $user->id]);

        $schools = Building::byType('school')->get();
        $offices = Building::byType('office')->get();

        $this->assertCount(2, $schools);
        $this->assertCount(3, $offices);
    }

    // ── Test 5: Scope search encuentra por nombre ─────────────

    public function test_scope_search_finds_buildings_by_name(): void
    {
        $user = $this->createUser();

        Building::factory()->create(['user_id' => $user->id, 'name' => 'Escuela Benito Juárez']);
        Building::factory()->create(['user_id' => $user->id, 'name' => 'Plaza Comercial']);
        Building::factory()->create(['user_id' => $user->id, 'name' => 'Escuela Técnica']);

        $results = Building::search('escuela')->get();

        $this->assertCount(2, $results);
    }

    // ── Test 6: Scope ownedBy filtra por usuario ──────────────

    public function test_scope_owned_by_filters_by_user(): void
    {
        $userA = $this->createUser();
        $userB = $this->createUser();

        Building::factory(3)->create(['user_id' => $userA->id]);
        Building::factory(2)->create(['user_id' => $userB->id]);

        $this->assertCount(3, Building::ownedBy($userA->id)->get());
        $this->assertCount(2, Building::ownedBy($userB->id)->get());
    }
}
