<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'day_of_week' => ['sometimes', 'integer', 'between:0,6'],
            'start_time'  => ['sometimes', 'date_format:H:i,H:i:s'],
            'end_time'    => ['sometimes', 'date_format:H:i,H:i:s', 'after:start_time'],
            'is_active'   => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'day_of_week.between'    => 'El día debe ser un valor entre 0 (Domingo) y 6 (Sábado).',
            'start_time.date_format' => 'La hora de inicio debe tener formato HH:MM.',
            'end_time.date_format'   => 'La hora de fin debe tener formato HH:MM.',
            'end_time.after'         => 'La hora de fin debe ser posterior a la hora de inicio.',
        ];
    }
}
