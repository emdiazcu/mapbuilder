<?php

namespace Tests\Feature;

use App\Models\Building;
use Tests\TestCase;

class BuildingApiTest extends TestCase
{
    // ── Test 1: Listar — usuario ve solo sus edificios ────────

    public function test_user_only_sees_own_buildings_in_list(): void
    {
        [$user, $token] = $this->actingAsUser();
        $other          = $this->createUser();

        Building::factory(3)->create(['user_id' => $user->id]);
        Building::factory(2)->create(['user_id' => $other->id]);

        $response = $this->getJson('/api/buildings', $this->bearerToken($token));

        $response->assertOk()
            ->assertJsonPath('meta.total', 3);
    }

    // ── Test 2: Admin ve todos los edificios ──────────────────

    public function test_admin_sees_all_buildings(): void
    {
        [$admin, $token] = $this->actingAsAdmin();
        $user            = $this->createUser();

        Building::factory(2)->create(['user_id' => $admin->id]);
        Building::factory(3)->create(['user_id' => $user->id]);

        $response = $this->getJson('/api/buildings', $this->bearerToken($token));

        $response->assertOk()
            ->assertJsonPath('meta.total', 5);
    }

    // ── Test 3: Crear edificio ────────────────────────────────

    public function test_user_can_create_building(): void
    {
        [, $token] = $this->actingAsUser();

        $response = $this->postJson('/api/buildings', [
            'name'      => 'Edificio de Prueba',
            'type'      => 'office',
            'latitude'  => 20.67,
            'longitude' => -103.35,
        ], $this->bearerToken($token));

        $response->assertStatus(201)
            ->assertJsonPath('name', 'Edificio de Prueba')
            ->assertJsonPath('type', 'office')
            ->assertJsonStructure(['public_token', 'public_url']);

        $this->assertDatabaseHas('buildings', ['name' => 'Edificio de Prueba']);
    }

    // ── Test 4: Validación falla con datos incorrectos ────────

    public function test_building_creation_fails_with_invalid_data(): void
    {
        [, $token] = $this->actingAsUser();

        $this->postJson('/api/buildings', [
            'name' => '',
            'type' => 'invalido',
        ], $this->bearerToken($token))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'type']);
    }

    // ── Test 5: Actualizar edificio propio ────────────────────

    public function test_user_can_update_own_building(): void
    {
        [$user, $token] = $this->actingAsUser();
        $building       = Building::factory()->create(['user_id' => $user->id]);

        $this->putJson("/api/buildings/{$building->id}", [
            'name' => 'Nombre Actualizado',
        ], $this->bearerToken($token))
            ->assertOk()
            ->assertJsonPath('name', 'Nombre Actualizado');
    }

    // ── Test 6: No puede editar edificio ajeno ────────────────

    public function test_user_cannot_update_other_users_building(): void
    {
        [, $token] = $this->actingAsUser();
        $other     = $this->createUser();
        $building  = Building::factory()->create(['user_id' => $other->id]);

        $this->putJson("/api/buildings/{$building->id}", [
            'name' => 'Intento de hack',
        ], $this->bearerToken($token))
            ->assertForbidden();
    }

    // ── Test 7: Eliminar edificio propio ──────────────────────

    public function test_user_can_delete_own_building(): void
    {
        [$user, $token] = $this->actingAsUser();
        $building       = Building::factory()->create(['user_id' => $user->id]);

        $this->deleteJson("/api/buildings/{$building->id}", [], $this->bearerToken($token))
            ->assertOk();

        $this->assertDatabaseMissing('buildings', ['id' => $building->id]);
    }

    // ── Test 8: Búsqueda por nombre ───────────────────────────

    public function test_buildings_can_be_searched_by_name(): void
    {
        [$user, $token] = $this->actingAsUser();

        Building::factory()->create(['user_id' => $user->id, 'name' => 'Escuela Benito Juárez']);
        Building::factory()->create(['user_id' => $user->id, 'name' => 'Plaza Comercial Norte']);
        Building::factory()->create(['user_id' => $user->id, 'name' => 'Escuela Secundaria']);

        $response = $this->getJson('/api/buildings?search=escuela', $this->bearerToken($token));

        $response->assertOk()
            ->assertJsonPath('meta.total', 2);
    }

    // ── Test 9: Búsqueda por tipo ─────────────────────────────

    public function test_buildings_can_be_filtered_by_type(): void
    {
        [$user, $token] = $this->actingAsUser();

        Building::factory(2)->school()->create(['user_id' => $user->id]);
        Building::factory(3)->commercial()->create(['user_id' => $user->id]);

        $response = $this->getJson('/api/buildings?type=school', $this->bearerToken($token));

        $response->assertOk()
            ->assertJsonPath('meta.total', 2);
    }
}
