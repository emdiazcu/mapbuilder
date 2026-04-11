<?php

namespace Database\Seeders;

use App\Models\Building;
use App\Models\Space;
use Illuminate\Database\Seeder;

class SpaceSeeder extends Seeder
{
    public function run(): void
    {
        $escuela = Building::where('name', 'Escuela Primaria Benito Juárez')->first();
        $plaza   = Building::where('name', 'Plaza Comercial Las Américas')->first();
        $oficina = Building::where('name', 'Edificio Corporativo Torre Norte')->first();

        $spaces = [
            // Escuela
            [
                'building_id'  => $escuela->id,
                'name'         => 'Aula 101',
                'type'         => 'classroom',
                'description'  => 'Aula de primer grado, grupo A.',
                'polygon_data' => [
                    ['x' => 50,  'y' => 50],
                    ['x' => 200, 'y' => 50],
                    ['x' => 200, 'y' => 150],
                    ['x' => 50,  'y' => 150],
                ],
                'color' => '#3b82f6',
            ],
            [
                'building_id'  => $escuela->id,
                'name'         => 'Biblioteca',
                'type'         => 'library',
                'description'  => 'Biblioteca escolar con acervo de 2,000 libros.',
                'polygon_data' => [
                    ['x' => 210, 'y' => 50],
                    ['x' => 400, 'y' => 50],
                    ['x' => 400, 'y' => 200],
                    ['x' => 210, 'y' => 200],
                ],
                'color' => '#10b981',
            ],
            [
                'building_id'  => $escuela->id,
                'name'         => 'Dirección',
                'type'         => 'office',
                'description'  => 'Oficina de la directora.',
                'polygon_data' => [
                    ['x' => 50,  'y' => 160],
                    ['x' => 200, 'y' => 160],
                    ['x' => 200, 'y' => 250],
                    ['x' => 50,  'y' => 250],
                ],
                'color' => '#f59e0b',
            ],
            // Plaza comercial
            [
                'building_id'  => $plaza->id,
                'name'         => 'Local 01 — Farmacia',
                'type'         => 'store',
                'description'  => 'Farmacia del Ahorro.',
                'polygon_data' => [
                    ['x' => 30,  'y' => 30],
                    ['x' => 180, 'y' => 30],
                    ['x' => 180, 'y' => 120],
                    ['x' => 30,  'y' => 120],
                ],
                'color' => '#ef4444',
            ],
            [
                'building_id'  => $plaza->id,
                'name'         => 'Área de Comida',
                'type'         => 'food_court',
                'description'  => 'Zona de restaurantes y puestos de comida.',
                'polygon_data' => [
                    ['x' => 190, 'y' => 30],
                    ['x' => 420, 'y' => 30],
                    ['x' => 420, 'y' => 200],
                    ['x' => 190, 'y' => 200],
                ],
                'color' => '#8b5cf6',
            ],
            // Corporativo
            [
                'building_id'  => $oficina->id,
                'name'         => 'Sala de Juntas A',
                'type'         => 'meeting_room',
                'description'  => 'Sala principal con capacidad para 20 personas.',
                'polygon_data' => [
                    ['x' => 40,  'y' => 40],
                    ['x' => 220, 'y' => 40],
                    ['x' => 220, 'y' => 160],
                    ['x' => 40,  'y' => 160],
                ],
                'color' => '#06b6d4',
            ],
            [
                'building_id'  => $oficina->id,
                'name'         => 'Recursos Humanos',
                'type'         => 'office',
                'description'  => 'Departamento de RRHH.',
                'polygon_data' => [
                    ['x' => 230, 'y' => 40],
                    ['x' => 400, 'y' => 40],
                    ['x' => 400, 'y' => 160],
                    ['x' => 230, 'y' => 160],
                ],
                'color' => '#f97316',
            ],
        ];

        foreach ($spaces as $data) {
            Space::firstOrCreate(
                ['building_id' => $data['building_id'], 'name' => $data['name']],
                $data
            );
        }
    }
}
