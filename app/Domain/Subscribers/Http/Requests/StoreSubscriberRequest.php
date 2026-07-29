<?php

namespace App\Domain\Subscribers\Http\Requests;

use App\Domain\Subscribers\Enums\SubscriberStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;
use Illuminate\Validation\Rules\Password;

class StoreSubscriberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:subscribers,email'],
            'phone' => ['nullable', 'string', 'max:30'],
            'password' => ['required', 'string', Password::defaults()],
            'plan_id' => ['nullable', 'exists:plans,id'],
            'status' => ['required', new Enum(SubscriberStatus::class)],
            'service_address' => ['required', 'string', 'max:500'],
            'zone' => ['required', 'string', 'max:100'],
            'monthly_bill' => ['required', 'numeric', 'min:0'],
        ];
    }
}
