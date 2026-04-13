<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ScheduleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'space_id'    => $this->space_id,
            'day_of_week' => $this->day_of_week,
            'day_name'    => $this->day_name,
            'start_time'  => $this->start_time,
            'end_time'    => $this->end_time,
            'is_active'   => $this->is_active,
            'created_at'  => $this->created_at?->toISOString(),
            'updated_at'  => $this->updated_at?->toISOString(),
        ];
    }
}
