<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BuildingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'user_id'          => $this->user_id,
            'name'             => $this->name,
            'description'      => $this->description,
            'type'             => $this->type,
            'latitude'         => $this->latitude,
            'longitude'        => $this->longitude,
            'is_favorite'      => (bool) $this->is_favorite,
            'floor_plan_image' => $this->floor_plan_image
                ? asset('storage/' . $this->floor_plan_image)
                : null,
            'public_token'     => $this->public_token,
            'public_url'       => url('/map/' . $this->public_token),
            'created_at'       => $this->created_at?->toISOString(),
            'updated_at'       => $this->updated_at?->toISOString(),
            // Relaciones opcionales
            'spaces'           => SpaceResource::collection($this->whenLoaded('spaces')),
            'spaces_count'     => $this->whenCounted('spaces'),
        ];
    }
}
