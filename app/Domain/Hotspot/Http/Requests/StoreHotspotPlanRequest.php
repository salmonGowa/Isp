<?php

namespace App\Domain\Hotspot\Http\Requests;

use App\Domain\Hotspot\Enums\HotspotPlanStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class StoreHotspotPlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'duration_minutes' => ['required', 'integer', 'min:1'],
            'price' => ['required', 'numeric', 'min:0'],
            'status' => ['sometimes', 'required', new Enum(HotspotPlanStatus::class)],
        ];
    }
}
