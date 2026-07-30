<?php

namespace App\Domain\FieldOps\Http\Requests;

use App\Domain\FieldOps\Enums\WorkOrderStatus;
use App\Domain\FieldOps\Enums\WorkOrderType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class UpdateWorkOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => ['sometimes', 'required', new Enum(WorkOrderType::class)],
            'address' => ['sometimes', 'required', 'string', 'max:500'],
            'scheduled_at' => ['sometimes', 'required', 'date'],
            'status' => ['sometimes', 'required', new Enum(WorkOrderStatus::class)],
            'technician_id' => ['nullable', 'exists:technicians,id'],
        ];
    }
}
