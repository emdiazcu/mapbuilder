<?php

namespace Database\Factories;

use App\Models\Schedule;
use App\Models\Space;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Schedule>
 */
class ScheduleFactory extends Factory
{
    public function definition(): array
    {
        $start = $this->faker->numberBetween(6, 16);

        return [
            'space_id'    => Space::factory(),
            'day_of_week' => $this->faker->numberBetween(0, 6),
            'start_time'  => \sprintf('%02d:00:00', $start),
            'end_time'    => \sprintf('%02d:00:00', $start + 2),
            'is_active'   => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(['is_active' => false]);
    }

    public function forDay(int $day): static
    {
        return $this->state(['day_of_week' => $day]);
    }
}
