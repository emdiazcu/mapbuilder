<?php

namespace Database\Seeders;

use App\Models\Schedule;
use App\Models\Space;
use Illuminate\Database\Seeder;

class ScheduleSeeder extends Seeder
{
    public function run(): void
    {
        $aula      = Space::where('name', 'Aula 101')->first();
        $biblioteca = Space::where('name', 'Biblioteca')->first();
        $local      = Space::where('name', 'Local 01 — Farmacia')->first();
        $sala       = Space::where('name', 'Sala de Juntas A')->first();

        $schedules = [
            // Aula 101 — Lun a Vie 7:00-14:00
            ...array_map(fn ($day) => [
                'space_id'    => $aula->id,
                'day_of_week' => $day,
                'start_time'  => '07:00:00',
                'end_time'    => '14:00:00',
                'is_active'   => true,
            ], [1, 2, 3, 4, 5]),

            // Biblioteca — Lun a Sáb 8:00-20:00
            ...array_map(fn ($day) => [
                'space_id'    => $biblioteca->id,
                'day_of_week' => $day,
                'start_time'  => '08:00:00',
                'end_time'    => '20:00:00',
                'is_active'   => true,
            ], [1, 2, 3, 4, 5, 6]),

            // Farmacia — todos los días 9:00-21:00
            ...array_map(fn ($day) => [
                'space_id'    => $local->id,
                'day_of_week' => $day,
                'start_time'  => '09:00:00',
                'end_time'    => '21:00:00',
                'is_active'   => true,
            ], [0, 1, 2, 3, 4, 5, 6]),

            // Sala de Juntas — Lun a Vie 9:00-18:00
            ...array_map(fn ($day) => [
                'space_id'    => $sala->id,
                'day_of_week' => $day,
                'start_time'  => '09:00:00',
                'end_time'    => '18:00:00',
                'is_active'   => true,
            ], [1, 2, 3, 4, 5]),
        ];

        foreach ($schedules as $data) {
            Schedule::firstOrCreate(
                [
                    'space_id'    => $data['space_id'],
                    'day_of_week' => $data['day_of_week'],
                ],
                $data
            );
        }
    }
}
