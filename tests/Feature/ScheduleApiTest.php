<?php

namespace Tests\Feature;

use App\Models\Building;
use App\Models\Schedule;
use App\Models\Space;
use Tests\TestCase;

class ScheduleApiTest extends TestCase
{
    // ── Test 1: Listar horarios de un espacio ─────────────────

    public function test_user_can_list_schedules_of_own_space(): void
    {
        [$user, $token] = $this->actingAsUser();
        $building       = Building::factory()->create(['user_id' => $user->id]);
        $space          = Space::factory()->create(['building_id' => $building->id]);

        Schedule::factory(3)->create(['space_id' => $space->id]);

        $response = $this->getJson(
            "/api/spaces/{$space->id}/schedules",
            $this->bearerToken($token)
        );

        $response->assertOk()
            ->assertJsonCount(3, 'data');
    }

    // ── Test 2: Crear horario en espacio propio ───────────────

    public function test_user_can_create_schedule_in_own_space(): void
    {
        [$user, $token] = $this->actingAsUser();
        $building       = Building::factory()->create(['user_id' => $user->id]);
        $space          = Space::factory()->create(['building_id' => $building->id]);

        $response = $this->postJson(
            "/api/spaces/{$space->id}/schedules",
            [
                'day_of_week' => 1,
                'start_time'  => '08:00',
                'end_time'    => '10:00',
                'is_active'   => true,
            ],
            $this->bearerToken($token)
        );

        $response->assertStatus(201)
            ->assertJsonPath('day_of_week', 1)
            ->assertJsonPath('start_time', fn ($v) => str_starts_with($v, '08:00'));

        $this->assertDatabaseHas('schedules', [
            'space_id'    => $space->id,
            'day_of_week' => 1,
        ]);
    }

    // ── Test 3: Validación — end_time debe ser posterior ──────

    public function test_schedule_creation_fails_when_end_time_is_before_start_time(): void
    {
        [$user, $token] = $this->actingAsUser();
        $building       = Building::factory()->create(['user_id' => $user->id]);
        $space          = Space::factory()->create(['building_id' => $building->id]);

        $this->postJson(
            "/api/spaces/{$space->id}/schedules",
            [
                'day_of_week' => 2,
                'start_time'  => '12:00',
                'end_time'    => '10:00',
                'is_active'   => true,
            ],
            $this->bearerToken($token)
        )->assertStatus(422)
            ->assertJsonValidationErrors(['end_time']);
    }

    // ── Test 4: Actualizar horario ────────────────────────────

    public function test_user_can_update_own_schedule(): void
    {
        [$user, $token] = $this->actingAsUser();
        $building       = Building::factory()->create(['user_id' => $user->id]);
        $space          = Space::factory()->create(['building_id' => $building->id]);
        $schedule       = Schedule::factory()->create(['space_id' => $space->id]);

        $this->putJson(
            "/api/schedules/{$schedule->id}",
            ['is_active' => false],
            $this->bearerToken($token)
        )->assertOk()
            ->assertJsonPath('is_active', false);
    }

    // ── Test 5: Eliminar horario ──────────────────────────────

    public function test_user_can_delete_own_schedule(): void
    {
        [$user, $token] = $this->actingAsUser();
        $building       = Building::factory()->create(['user_id' => $user->id]);
        $space          = Space::factory()->create(['building_id' => $building->id]);
        $schedule       = Schedule::factory()->create(['space_id' => $space->id]);

        $this->deleteJson(
            "/api/schedules/{$schedule->id}",
            [],
            $this->bearerToken($token)
        )->assertOk();

        $this->assertDatabaseMissing('schedules', ['id' => $schedule->id]);
    }

    // ── Test 6: No puede acceder a horarios de espacio ajeno ──

    public function test_user_cannot_list_schedules_of_other_users_space(): void
    {
        [, $token] = $this->actingAsUser();
        $other     = $this->createUser();
        $building  = Building::factory()->create(['user_id' => $other->id]);
        $space     = Space::factory()->create(['building_id' => $building->id]);

        Schedule::factory(2)->create(['space_id' => $space->id]);

        $this->getJson(
            "/api/spaces/{$space->id}/schedules",
            $this->bearerToken($token)
        )->assertForbidden();
    }
}
