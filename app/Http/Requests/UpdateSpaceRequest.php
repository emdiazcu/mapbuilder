<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSpaceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'                   => ['sometimes', 'string', 'max:255'],
            'type'                   => ['sometimes', 'string', 'max:100'],
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
            'polygon_data.*.x' => 'Cada punto del polígono debe tener coordenada X.',
            'polygon_data.*.y' => 'Cada punto del polígono debe tener coordenada Y.',
            'color.regex'      => 'El color debe ser un código hexadecimal válido (#RRGGBB).',
        ];
    }
}
