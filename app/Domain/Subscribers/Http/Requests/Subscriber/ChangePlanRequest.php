<?php

namespace App\Domain\Subscribers\Http\Requests\Subscriber;

use App\Domain\Plans\Enums\PlanStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ChangePlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'plan_id' => ['required', Rule::exists('plans', 'id')->where('status', PlanStatus::Active->value)],
        ];
    }
}
