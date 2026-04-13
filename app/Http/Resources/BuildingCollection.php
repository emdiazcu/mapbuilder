<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

class BuildingCollection extends ResourceCollection
{
    public $collects = BuildingResource::class;

    // Laravel genera automáticamente el meta con paginación
    // (current_page, last_page, per_page, total, from, to, links)
}
