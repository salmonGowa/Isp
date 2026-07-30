<?php

namespace App\Domain\FieldOps\Http\Requests;

use App\Domain\FieldOps\Enums\WorkOrderType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class StoreWorkOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', new Enum(WorkOrderType::class)],
            'subscriber_id' => [Rule::requiredIf(fn () => ! $this->filled('lead_name')), 'nullable', 'exists:subscribers,id'],
            'lead_name' => [Rule::requiredIf(fn () => ! $this->filled('subscriber_id')), 'nullable', 'string', 'max:255'],
            'address' => ['required', 'string', 'max:500'],
            'scheduled_at' => ['required', 'date'],
        ];
    }
}
