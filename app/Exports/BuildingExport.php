<?php

namespace App\Exports;

use App\Models\Building;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class BuildingExport implements FromCollection, WithHeadings, WithMapping, WithTitle, ShouldAutoSize, WithStyles
{
    public function __construct(private Building $building)
    {
        $this->building->loadMissing('spaces.schedules');
    }

    public function collection()
    {
        // Aplanamos spaces + schedules en filas para Excel
        $rows = collect();

        foreach ($this->building->spaces as $space) {
            if ($space->schedules->isEmpty()) {
                $rows->push(['space' => $space, 'schedule' => null]);
            } else {
                foreach ($space->schedules as $schedule) {
                    $rows->push(['space' => $space, 'schedule' => $schedule]);
                }
            }
        }

        return $rows;
    }

    public function headings(): array
    {
        return [
            'Edificio',
            'Tipo de Edificio',
            'Espacio',
            'Tipo de Espacio',
            'Descripción',
            'Día',
            'Hora Inicio',
            'Hora Fin',
            'Activo',
        ];
    }

    public function map($row): array
    {
        $schedule = $row['schedule'];
        $space    = $row['space'];

        return [
            $this->building->name,
            $this->building->type,
            $space->name,
            $space->type,
            $space->description ?? '—',
            $schedule ? $schedule->day_name    : '—',
            $schedule ? $schedule->start_time  : '—',
            $schedule ? $schedule->end_time    : '—',
            $schedule ? ($schedule->is_active ? 'Sí' : 'No') : '—',
        ];
    }

    public function title(): string
    {
        return substr($this->building->name, 0, 31); // Excel limita a 31 chars
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
