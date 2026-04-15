<?php

namespace Tests\Unit;

use App\Models\Building;
use App\Models\Schedule;
use App\Models\Space;
use Tests\TestCase;

class SpaceModelTest extends TestCase
{
    // ── Test 1: polygon_data se castea a array ────────────────

    public function test_polygon_data_is_cast_to_array(): void
    {
        $user     = $this->createUser();
        $building = Building::factory()->create(['user_id' => $user->id]);
        $space    = Space::factory()->create(['building_id' => $building->id]);

        $this->assertIsArray($space->polygon_data);
        $this->assertNotEmpty($space->polygon_data);
    }

    // ── Test 2: Relación con Building ─────────────────────────

    public function test_space_belongs_to_building(): void
    {
        $user     = $this->createUser();
        $building = Building::factory()->create(['user_id' => $user->id]);
        $space    = Space::factory()->create(['building_id' => $building->id]);

        $this->assertInstanceOf(Building::class, $space->building);
        $this->assertEquals($building->id, $space->building->id);
    }

    // ── Test 3: Relación con Schedules ────────────────────────

    public function test_space_has_many_schedules(): void
    {
        $user     = $this->createUser();
        $building = Building::factory()->create(['user_id' => $user->id]);
        $space    = Space::factory()->create(['building_id' => $building->id]);

        Schedule::factory(4)->create(['space_id' => $space->id]);

        $this->assertCount(4, $space->schedules);
    }

    // ── Test 4: Scope search encuentra por nombre ─────────────

    public function test_scope_search_finds_spaces_by_name(): void
    {
        $user     = $this->createUser();
        $building = Building::factory()->create(['user_id' => $user->id]);

        Space::factory()->create(['building_id' => $building->id, 'name' => 'Aula Magna', 'type' => 'classroom']);
        Space::factory()->create(['building_id' => $building->id, 'name' => 'Sala de Juntas', 'type' => 'meeting_room']);
        Space::factory()->create(['building_id' => $building->id, 'name' => 'Aula 201', 'type' => 'classroom']);

        $results = Space::search('aula')->get();

        $this->assertCount(2, $results);
    }

    // ── Test 5: Scope active devuelve espacios con horarios activos ──

    public function test_scope_active_returns_spaces_with_active_schedules(): void
    {
        $user     = $this->createUser();
        $building = Building::factory()->create(['user_id' => $user->id]);

        $activeSpace   = Space::factory()->create(['building_id' => $building->id]);
        $inactiveSpace = Space::factory()->create(['building_id' => $building->id]);

        Schedule::factory()->create(['space_id' => $activeSpace->id, 'is_active' => true]);
        Schedule::factory()->inactive()->create(['space_id' => $inactiveSpace->id]);

        $results = Space::active()->get();

        $this->assertCount(1, $results);
        $this->assertEquals($activeSpace->id, $results->first()->id);
    }

    // ── Test 6: Space sin horarios no aparece en scope active ─

    public function test_space_without_schedules_is_not_active(): void
    {
        $user     = $this->createUser();
        $building = Building::factory()->create(['user_id' => $user->id]);

        Space::factory()->create(['building_id' => $building->id]);

        $results = Space::active()->get();

        $this->assertCount(0, $results);
    }
}
