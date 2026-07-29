<?php

namespace App\Domain\Staff\Http\Requests;

use App\Domain\Staff\Enums\StaffRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;
use Illuminate\Validation\Rules\Password;

class UpdateStaffRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($this->route('staff'))],
            'password' => ['nullable', 'string', Password::defaults()],
            'role' => ['sometimes', 'required', new Enum(StaffRole::class)],
        ];
    }
}
