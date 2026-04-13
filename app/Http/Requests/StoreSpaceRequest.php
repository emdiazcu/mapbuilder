<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSpaceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'                   => ['required', 'string', 'max:255'],
            'type'                   => ['required', 'string', 'max:100'],
            'description'            => ['nullable', 'string', 'max:1000'],
            'polygon_data'           => ['nullable', 'array'],
            'polygon_data.*.x'       => ['required_with:polygon_data', 'numeric'],
            'polygon_data.*.y'       => ['required_with:polygon_data', 'numeric'],
            'color'                  => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'          => 'El nombre del espacio es obligatorio.',
            'type.required'          => 'El tipo de espacio es obligatorio.',
            'polygon_data.*.x'       => 'Cada punto del polígono debe tener coordenada X.',
            'polygon_data.*.y'       => 'Cada punto del polígono debe tener coordenada Y.',
            'color.regex'            => 'El color debe ser un código hexadecimal válido (#RRGGBB).',
        ];
    }
}
