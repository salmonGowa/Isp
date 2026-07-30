<?php

namespace App\Domain\FieldOps\Http\Requests;

use App\Domain\FieldOps\Enums\TechnicianStatus;
use App\Domain\Staff\Enums\StaffRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class StoreTechnicianRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => [
                'required',
                Rule::exists('users', 'id')->where(fn ($q) => $q->where('role', StaffRole::Technician->value)),
                'unique:technicians,user_id',
            ],
            'zone' => ['required', 'string', 'max:100'],
            'status' => ['sometimes', 'required', new Enum(TechnicianStatus::class)],
            'current_job_description' => ['nullable', 'string', 'max:255'],
        ];
    }
}
