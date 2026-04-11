<?php

namespace Database\Seeders;

use App\Models\Building;
use App\Models\User;
use Illuminate\Database\Seeder;

class BuildingSeeder extends Seeder
{
    public function run(): void
    {
        $juan    = User::where('email', 'juan@example.com')->first();
        $maria   = User::where('email', 'maria@example.com')->first();
        $carlos  = User::where('email', 'carlos@example.com')->first();

        $buildings = [
            [
                'user_id'     => $juan->id,
                'name'        => 'Escuela Primaria Benito Juárez',
                'description' => 'Escuela pública de nivel primaria con 18 aulas.',
                'type'        => 'school',
                'latitude'    => 20.6597,
                'longitude'   => -103.3496,
            ],
            [
                'user_id'     => $juan->id,
                'name'        => 'Preparatoria UNAM Campus Sur',
                'description' => 'Preparatoria con laboratorios y biblioteca.',
                'type'        => 'school',
                'latitude'    => 20.6450,
                'longitude'   => -103.3600,
            ],
            [
                'user_id'     => $maria->id,
                'name'        => 'Plaza Comercial Las Américas',
                'description' => 'Centro comercial con 120 locales y área de comida.',
                'type'        => 'commercial',
                'latitude'    => 20.6720,
                'longitude'   => -103.3800,
            ],
            [
                'user_id'     => $maria->id,
                'name'        => 'Edificio Corporativo Torre Norte',
                'description' => 'Oficinas corporativas de 10 pisos.',
                'type'        => 'office',
                'latitude'    => 20.6800,
                'longitude'   => -103.3500,
            ],
            [
                'user_id'     => $carlos->id,
                'name'        => 'Palacio Municipal de Guadalajara',
                'description' => 'Dependencia de gobierno municipal.',
                'type'        => 'dependency',
                'latitude'    => 20.6736,
                'longitude'   => -103.3441,
            ],
        ];

        foreach ($buildings as $data) {
            Building::firstOrCreate(
                ['name' => $data['name'], 'user_id' => $data['user_id']],
                $data
            );
        }
    }
}
