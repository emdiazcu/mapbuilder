<?php

namespace Tests\Unit;

use App\Models\Building;
use Tests\TestCase;

class BuildingSearchTest extends TestCase
{
    // ── Test 1: Búsqueda es case-insensitive ──────────────────

    public function test_search_is_case_insensitive(): void
    {
        $user = $this->createUser();

        Building::factory()->create(['user_id' => $user->id, 'name' => 'ESCUELA PRIMARIA']);
        Building::factory()->create(['user_id' => $user->id, 'name' => 'Plaza Comercial']);

        $this->assertCount(1, Building::search('escuela')->get());
        $this->assertCount(1, Building::search('ESCUELA')->get());
        $this->assertCount(1, Building::search('Escuela')->get());
    }

    // ── Test 2: Búsqueda parcial por nombre ───────────────────

    public function test_search_matches_partial_name(): void
    {
        $user = $this->createUser();

        Building::factory()->create(['user_id' => $user->id, 'name' => 'Universidad Autónoma']);
        Building::factory()->create(['user_id' => $user->id, 'name' => 'Centro Universitario']);
        Building::factory()->create(['user_id' => $user->id, 'name' => 'Preparatoria Federal']);

        $this->assertCount(2, Building::search('uni')->get());
    }

    // ── Test 3: Búsqueda también encuentra en description ─────

    public function test_search_also_matches_description(): void
    {
        $user = $this->createUser();

        Building::factory()->create([
            'user_id'     => $user->id,
            'name'        => 'Edificio Central',
            'description' => 'Sede principal del campus universitario',
        ]);
        Building::factory()->create([
            'user_id'     => $user->id,
            'name'        => 'Bodega Norte',
            'description' => 'Almacén de herramientas',
        ]);

        $results = Building::search('campus')->get();

        $this->assertCount(1, $results);
        $this->assertEquals('Edificio Central', $results->first()->name);
    }

    // ── Test 4: Sin coincidencias devuelve colección vacía ────

    public function test_search_returns_empty_when_no_match(): void
    {
        $user = $this->createUser();

        Building::factory(3)->create(['user_id' => $user->id]);

        $results = Building::search('xyzabcnomatch')->get();

        $this->assertCount(0, $results);
    }

    // ── Test 5: byType y search se pueden encadenar ───────────

    public function test_search_and_by_type_can_be_chained(): void
    {
        $user = $this->createUser();

        Building::factory()->create([
            'user_id' => $user->id,
            'name'    => 'Escuela Técnica',
            'type'    => 'school',
        ]);
        Building::factory()->create([
            'user_id' => $user->id,
            'name'    => 'Escuela de Negocios',
            'type'    => 'office',
        ]);

        $results = Building::search('escuela')->byType('school')->get();

        $this->assertCount(1, $results);
        $this->assertEquals('school', $results->first()->type);
    }

    // ── Test 6: ownedBy y search se pueden encadenar ─────────

    public function test_search_and_owned_by_can_be_chained(): void
    {
        $userA = $this->createUser();
        $userB = $this->createUser();

        Building::factory()->create(['user_id' => $userA->id, 'name' => 'Edificio Azul']);
        Building::factory()->create(['user_id' => $userB->id, 'name' => 'Edificio Rojo']);

        $results = Building::search('edificio')->ownedBy($userA->id)->get();

        $this->assertCount(1, $results);
        $this->assertEquals($userA->id, $results->first()->user_id);
    }
}
