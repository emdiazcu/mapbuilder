<?php

namespace Tests\Unit;

use App\Models\Building;
use App\Models\Schedule;
use App\Models\Space;
use Tests\TestCase;

class ScheduleModelTest extends TestCase
{
    // ── Test 1: day_name accessor devuelve nombre correcto ────

    public function test_day_name_accessor_returns_correct_name(): void
    {
        $user     = $this->createUser();
        $building = Building::factory()->create(['user_id' => $user->id]);
        $space    = Space::factory()->create(['building_id' => $building->id]);

        $schedule = Schedule::factory()->create([
            'space_id'    => $space->id,
            'day_of_week' => 1,
        ]);

        $this->assertEquals('Lunes', $schedule->day_name);
    }

    // ── Test 2: DAYS cubre los 7 días ────────────────────────

    public function test_days_constant_covers_all_weekdays(): void
    {
        $this->assertCount(7, Schedule::DAYS);
        $this->assertEquals('Domingo',   Schedule::DAYS[0]);
        $this->assertEquals('Sábado',    Schedule::DAYS[6]);
    }

    // ── Test 3: Scope active filtra horarios activos ──────────

    public function test_scope_active_returns_only_active_schedules(): void
    {
        $user     = $this->createUser();
        $building = Building::factory()->create(['user_id' => $user->id]);
        $space    = Space::factory()->create(['building_id' => $building->id]);

        Schedule::factory(3)->create(['space_id' => $space->id, 'is_active' => true]);
        Schedule::factory(2)->inactive()->create(['space_id' => $space->id]);

        $actives = Schedule::active()->get();

        $this->assertCount(3, $actives);
        $actives->each(fn ($s) => $this->assertTrue($s->is_active));
    }

    // ── Test 4: Scope forDay filtra por día de la semana ──────

    public function test_scope_for_day_filters_by_day_of_week(): void
    {
        $user     = $this->createUser();
        $building = Building::factory()->create(['user_id' => $user->id]);
        $space    = Space::factory()->create(['building_id' => $building->id]);

        Schedule::factory()->forDay(1)->create(['space_id' => $space->id]);
        Schedule::factory()->forDay(1)->create(['space_id' => $space->id]);
        Schedule::factory()->forDay(3)->create(['space_id' => $space->id]);

        $mondays = Schedule::forDay(1)->get();

        $this->assertCount(2, $mondays);
    }

    // ── Test 5: is_active se castea a boolean ─────────────────

    public function test_is_active_is_cast_to_boolean(): void
    {
        $user     = $this->createUser();
        $building = Building::factory()->create(['user_id' => $user->id]);
        $space    = Space::factory()->create(['building_id' => $building->id]);

        $schedule = Schedule::factory()->create([
            'space_id'  => $space->id,
            'is_active' => true,
        ]);

        $this->assertIsBool($schedule->is_active);
        $this->assertTrue($schedule->is_active);
    }

    // ── Test 6: Relación con Space ────────────────────────────

    public function test_schedule_belongs_to_space(): void
    {
        $user     = $this->createUser();
        $building = Building::factory()->create(['user_id' => $user->id]);
        $space    = Space::factory()->create(['building_id' => $building->id]);
        $schedule = Schedule::factory()->create(['space_id' => $space->id]);

        $this->assertInstanceOf(Space::class, $schedule->space);
        $this->assertEquals($space->id, $schedule->space->id);
    }
}
