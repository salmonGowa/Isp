<?php

namespace App\Domain\Hotspot\Http\Requests;

use App\Domain\Hotspot\Enums\HotspotPlanStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PurchaseSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'mac_address' => ['required', 'regex:/^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/'],
            'hotspot_plan_id' => ['required', Rule::exists('hotspot_plans', 'id')->where('status', HotspotPlanStatus::Active->value)],
            'payment_reference' => ['nullable', 'string', 'max:255'],
        ];
    }
}
