<?php

namespace App\Domain\Hotspot\Http\Requests;

use App\Domain\Hotspot\Enums\HotspotPlanStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class UpdateHotspotPlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'duration_minutes' => ['sometimes', 'required', 'integer', 'min:1'],
            'price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'status' => ['sometimes', 'required', new Enum(HotspotPlanStatus::class)],
        ];
    }
}
