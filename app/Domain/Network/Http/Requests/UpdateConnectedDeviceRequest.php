<?php

namespace App\Domain\Network\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateConnectedDeviceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'is_paused' => ['required', 'boolean'],
        ];
    }
}
