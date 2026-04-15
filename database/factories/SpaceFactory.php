<?php

namespace Database\Factories;

use App\Models\Building;
use App\Models\Space;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Space>
 */
class SpaceFactory extends Factory
{
    public function definition(): array
    {
        return [
            'building_id'  => Building::factory(),
            'name'         => $this->faker->randomElement(['Aula', 'Oficina', 'Sala', 'Local']) . ' ' . $this->faker->numerify('###'),
            'type'         => $this->faker->randomElement(['classroom', 'office', 'meeting_room', 'store']),
            'description'  => $this->faker->sentence(),
            'polygon_data' => [
                ['x' => 10, 'y' => 10],
                ['x' => 100, 'y' => 10],
                ['x' => 100, 'y' => 80],
                ['x' => 10, 'y' => 80],
            ],
            'color'        => $this->faker->hexColor(),
        ];
    }
}
