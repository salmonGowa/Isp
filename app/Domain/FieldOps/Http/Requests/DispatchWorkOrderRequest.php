<?php

namespace App\Domain\FieldOps\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DispatchWorkOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'technician_id' => ['required', 'exists:technicians,id'],
            'scheduled_at' => ['sometimes', 'date'],
        ];
    }
}
