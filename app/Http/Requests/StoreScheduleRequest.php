<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'day_of_week' => ['required', 'integer', 'between:0,6'],
            'start_time'  => ['required', 'date_format:H:i,H:i:s'],
            'end_time'    => ['required', 'date_format:H:i,H:i:s', 'after:start_time'],
            'is_active'   => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'day_of_week.required' => 'El día de la semana es obligatorio.',
            'day_of_week.between'  => 'El día debe ser un valor entre 0 (Domingo) y 6 (Sábado).',
            'start_time.required'  => 'La hora de inicio es obligatoria.',
            'start_time.date_format' => 'La hora de inicio debe tener formato HH:MM.',
            'end_time.required'    => 'La hora de fin es obligatoria.',
            'end_time.date_format' => 'La hora de fin debe tener formato HH:MM.',
            'end_time.after'       => 'La hora de fin debe ser posterior a la hora de inicio.',
        ];
    }
}
