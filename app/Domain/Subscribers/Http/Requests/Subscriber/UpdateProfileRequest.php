<?php

namespace App\Domain\Subscribers\Http\Requests\Subscriber;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'required', 'email', 'max:255', Rule::unique('subscribers', 'email')->ignore($this->user('subscriber'))],
            'phone' => ['sometimes', 'nullable', 'string', 'max:30'],
            'service_address' => ['sometimes', 'required', 'string', 'max:500'],
        ];
    }
}
