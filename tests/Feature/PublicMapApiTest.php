<?php

namespace Tests\Feature;

use App\Models\Building;
use App\Models\Schedule;
use App\Models\Space;
use Tests\TestCase;

class PublicMapApiTest extends TestCase
{
    // ── Test 1: Acceso público por token válido ───────────────

    public function test_public_map_returns_building_by_token(): void
    {
        $user     = $this->createUser();
        $building = Building::factory()->create(['user_id' => $user->id]);

        $response = $this->getJson("/api/maps/{$building->public_token}/public");

        $response->assertOk()
            ->assertJsonPath('id', $building->id)
            ->assertJsonPath('name', $building->name)
            ->assertJsonStructure(['id', 'name', 'type', 'public_token', 'spaces']);
    }

    // ── Test 2: Token inválido devuelve 404 ───────────────────

    public function test_public_map_returns_404_for_invalid_token(): void
    {
        $this->getJson('/api/maps/token-que-no-existe/public')
            ->assertNotFound();
    }

    // ── Test 3: La respuesta incluye espacios con horarios ────

    public function test_public_map_includes_spaces_with_active_schedules(): void
    {
        $user     = $this->createUser();
        $building = Building::factory()->create(['user_id' => $user->id]);
        $space    = Space::factory()->create(['building_id' => $building->id]);

        Schedule::factory()->create(['space_id' => $space->id, 'is_active' => true]);
        Schedule::factory()->inactive()->create(['space_id' => $space->id]);

        $response = $this->getJson("/api/maps/{$building->public_token}/public");

        $response->assertOk();

        // El espacio aparece en la respuesta
        $spaces = $response->json('spaces');
        $this->assertCount(1, $spaces);

        // Solo el horario activo se incluye
        $this->assertCount(1, $spaces[0]['schedules']);
    }

    // ── Test 4: No requiere autenticación ─────────────────────

    public function test_public_map_does_not_require_authentication(): void
    {
        $user     = $this->createUser();
        $building = Building::factory()->create(['user_id' => $user->id]);

        // Sin ningún header de autenticación
        $this->getJson(
            "/api/maps/{$building->public_token}/public",
            $this->jsonHeaders()
        )->assertOk();
    }

    // ── Test 5: Edificio sin espacios devuelve array vacío ────

    public function test_public_map_returns_empty_spaces_when_building_has_none(): void
    {
        $user     = $this->createUser();
        $building = Building::factory()->create(['user_id' => $user->id]);

        $response = $this->getJson("/api/maps/{$building->public_token}/public");

        $response->assertOk()
            ->assertJsonPath('spaces', []);
    }
}
