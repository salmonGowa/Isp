<?php

namespace App\Domain\Subscribers\Http\Requests\Subscriber;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class UpdatePasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Guard parameter is required: this app's default guard isn't
            // "subscriber", so the current_password rule must be told which
            // guard's session to check against or it will always fail here.
            'current_password' => ['required', 'current_password:subscriber'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ];
    }
}
