<?php

namespace App\Domain\Hotspot\Http\Requests;

use App\Domain\Hotspot\Enums\HotspotPlanStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class PurchaseSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if (is_string($this->input('mac_address'))) {
            $this->merge(['mac_address' => strtoupper(trim($this->input('mac_address')))]);
        }
    }

    public function rules(): array
    {
        return [
            'mac_address' => ['required', 'regex:/^([0-9A-F]{2}:){5}[0-9A-F]{2}$/'],
            'hotspot_plan_id' => ['required', Rule::exists('hotspot_plans', 'id')->where('status', HotspotPlanStatus::Active->value)],
            'payment_reference' => ['required', 'string', 'max:255'],
            'signature' => [config('hotspot.mac_signing_secret') ? 'required' : 'nullable', 'string'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                $secret = config('hotspot.mac_signing_secret');
                if (! $secret || $validator->errors()->isNotEmpty()) {
                    return;
                }

                $expected = hash_hmac('sha256', (string) $this->input('mac_address'), $secret);

                if (! hash_equals($expected, strtolower((string) $this->input('signature')))) {
                    $validator->errors()->add('mac_address', 'This device could not be verified. Reconnect to the hotspot and try again.');
                }
            },
        ];
    }
}
