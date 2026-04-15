<?php

namespace Database\Factories;

use App\Models\Building;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Building>
 */
class BuildingFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id'          => User::factory(),
            'name'             => $this->faker->company() . ' ' . $this->faker->randomElement(['Building', 'Center', 'Plaza', 'Campus']),
            'description'      => $this->faker->sentence(),
            'type'             => $this->faker->randomElement(['school', 'commercial', 'office', 'dependency']),
            'latitude'         => $this->faker->latitude(19, 22),
            'longitude'        => $this->faker->longitude(-105, -100),
            'floor_plan_image' => null,
        ];
    }

    public function school(): static
    {
        return $this->state(['type' => 'school']);
    }

    public function commercial(): static
    {
        return $this->state(['type' => 'commercial']);
    }

    public function office(): static
    {
        return $this->state(['type' => 'office']);
    }
}
