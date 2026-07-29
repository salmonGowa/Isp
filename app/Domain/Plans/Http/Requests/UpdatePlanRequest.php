<?php

namespace App\Domain\Plans\Http\Requests;

use App\Domain\Plans\Enums\PlanStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class UpdatePlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'download_mbps' => ['sometimes', 'required', 'integer', 'min:1'],
            'upload_mbps' => ['sometimes', 'required', 'integer', 'min:1'],
            'price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'status' => ['sometimes', 'required', new Enum(PlanStatus::class)],
        ];
    }
}
