<?php

namespace App\Domain\Subscribers\Http\Requests;

use App\Domain\Subscribers\Enums\SubscriberStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;
use Illuminate\Validation\Rules\Password;

class UpdateSubscriberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'required', 'email', 'max:255', Rule::unique('subscribers', 'email')->ignore($this->route('subscriber'))],
            'phone' => ['nullable', 'string', 'max:30'],
            'password' => ['nullable', 'string', Password::defaults()],
            'plan_id' => ['nullable', 'exists:plans,id'],
            'status' => ['sometimes', 'required', new Enum(SubscriberStatus::class)],
            'service_address' => ['sometimes', 'required', 'string', 'max:500'],
            'zone' => ['sometimes', 'required', 'string', 'max:100'],
            'monthly_bill' => ['sometimes', 'required', 'numeric', 'min:0'],
        ];
    }
}
