<?php

namespace Tests\Feature;

use App\Models\Building;
use App\Models\Space;
use Tests\TestCase;

class SpaceApiTest extends TestCase
{
    // ── Test 1: Listar espacios de un edificio propio ─────────

    public function test_user_can_list_spaces_of_own_building(): void
    {
        [$user, $token] = $this->actingAsUser();
        $building       = Building::factory()->create(['user_id' => $user->id]);

        Space::factory(4)->create(['building_id' => $building->id]);

        $response = $this->getJson(
            "/api/buildings/{$building->id}/spaces",
            $this->bearerToken($token)
        );

        $response->assertOk()
            ->assertJsonCount(4, 'data');
    }

    // ── Test 2: No puede ver espacios de edificio ajeno ───────

    public function test_user_cannot_list_spaces_of_other_users_building(): void
    {
        [, $token] = $this->actingAsUser();
        $other     = $this->createUser();
        $building  = Building::factory()->create(['user_id' => $other->id]);

        Space::factory(2)->create(['building_id' => $building->id]);

        $this->getJson(
            "/api/buildings/{$building->id}/spaces",
            $this->bearerToken($token)
        )->assertForbidden();
    }

    // ── Test 3: Crear espacio en edificio propio ──────────────

    public function test_user_can_create_space_in_own_building(): void
    {
        [$user, $token] = $this->actingAsUser();
        $building       = Building::factory()->create(['user_id' => $user->id]);

        $response = $this->postJson(
            "/api/buildings/{$building->id}/spaces",
            [
                'name'         => 'Aula 101',
                'type'         => 'classroom',
                'description'  => 'Aula de primer piso',
                'polygon_data' => [
                    ['x' => 0, 'y' => 0],
                    ['x' => 100, 'y' => 0],
                    ['x' => 100, 'y' => 80],
                    ['x' => 0, 'y' => 80],
                ],
                'color'        => '#ff0000',
            ],
            $this->bearerToken($token)
        );

        $response->assertStatus(201)
            ->assertJsonPath('name', 'Aula 101')
            ->assertJsonPath('type', 'classroom');

        $this->assertDatabaseHas('spaces', ['name' => 'Aula 101', 'building_id' => $building->id]);
    }

    // ── Test 4: No puede crear espacio en edificio ajeno ──────

    public function test_user_cannot_create_space_in_other_users_building(): void
    {
        [, $token] = $this->actingAsUser();
        $other     = $this->createUser();
        $building  = Building::factory()->create(['user_id' => $other->id]);

        $this->postJson(
            "/api/buildings/{$building->id}/spaces",
            [
                'name'         => 'Espacio Ilegítimo',
                'type'         => 'office',
                'polygon_data' => [['x' => 0, 'y' => 0]],
            ],
            $this->bearerToken($token)
        )->assertForbidden();
    }

    // ── Test 5: Actualizar espacio propio ─────────────────────

    public function test_user_can_update_own_space(): void
    {
        [$user, $token] = $this->actingAsUser();
        $building       = Building::factory()->create(['user_id' => $user->id]);
        $space          = Space::factory()->create(['building_id' => $building->id]);

        $this->putJson(
            "/api/spaces/{$space->id}",
            ['name' => 'Sala Actualizada'],
            $this->bearerToken($token)
        )->assertOk()
            ->assertJsonPath('name', 'Sala Actualizada');
    }

    // ── Test 6: Eliminar espacio propio ───────────────────────

    public function test_user_can_delete_own_space(): void
    {
        [$user, $token] = $this->actingAsUser();
        $building       = Building::factory()->create(['user_id' => $user->id]);
        $space          = Space::factory()->create(['building_id' => $building->id]);

        $this->deleteJson(
            "/api/spaces/{$space->id}",
            [],
            $this->bearerToken($token)
        )->assertOk();

        $this->assertDatabaseMissing('spaces', ['id' => $space->id]);
    }
}
