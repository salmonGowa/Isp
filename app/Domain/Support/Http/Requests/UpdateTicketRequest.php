<?php

namespace App\Domain\Support\Http\Requests;

use App\Domain\Support\Enums\TicketPriority;
use App\Domain\Support\Enums\TicketStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class UpdateTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'subject' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'required', 'string'],
            'priority' => ['sometimes', 'required', new Enum(TicketPriority::class)],
            'status' => ['sometimes', 'required', new Enum(TicketStatus::class)],
            'assignee_id' => ['nullable', 'exists:users,id'],
        ];
    }
}
