<?php

namespace App\Domain\FieldOps\Http\Requests;

use App\Domain\FieldOps\Enums\TechnicianStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class UpdateTechnicianRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'zone' => ['sometimes', 'required', 'string', 'max:100'],
            'status' => ['sometimes', 'required', new Enum(TechnicianStatus::class)],
            'current_job_description' => ['nullable', 'string', 'max:255'],
        ];
    }
}
