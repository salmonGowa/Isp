<?php

namespace App\Domain\Plans\Http\Requests;

use App\Domain\Plans\Enums\PlanStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class StorePlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'download_mbps' => ['required', 'integer', 'min:1'],
            'upload_mbps' => ['required', 'integer', 'min:1'],
            'price' => ['required', 'numeric', 'min:0'],
            'status' => ['sometimes', 'required', new Enum(PlanStatus::class)],
        ];
    }
}
