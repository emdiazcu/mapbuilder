<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SpaceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'building_id'  => $this->building_id,
            'name'         => $this->name,
            'type'         => $this->type,
            'description'  => $this->description,
            'polygon_data' => $this->polygon_data,
            'color'        => $this->color,
            'created_at'   => $this->created_at?->toISOString(),
            'updated_at'   => $this->updated_at?->toISOString(),
            // Cargado solo si el relationship fue eager loaded
            'schedules'    => ScheduleResource::collection($this->whenLoaded('schedules')),
        ];
    }
}
