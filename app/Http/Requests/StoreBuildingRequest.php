<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBuildingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'             => ['required', 'string', 'max:255'],
            'description'      => ['nullable', 'string', 'max:1000'],
            'type'             => ['required', 'in:school,commercial,office,dependency'],
            'latitude'         => ['nullable', 'numeric', 'between:-90,90'],
            'longitude'        => ['nullable', 'numeric', 'between:-180,180'],
            'floor_plan_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'          => 'El nombre del edificio es obligatorio.',
            'name.max'               => 'El nombre no puede superar 255 caracteres.',
            'type.required'          => 'El tipo de edificio es obligatorio.',
            'type.in'                => 'El tipo debe ser: school, commercial, office o dependency.',
            'latitude.between'       => 'La latitud debe estar entre -90 y 90.',
            'longitude.between'      => 'La longitud debe estar entre -180 y 180.',
            'floor_plan_image.image' => 'El plano debe ser una imagen válida.',
            'floor_plan_image.max'   => 'La imagen no puede superar 5 MB.',
        ];
    }
}
