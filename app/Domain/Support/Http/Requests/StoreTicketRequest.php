<?php

namespace App\Domain\Support\Http\Requests;

use App\Domain\Support\Enums\TicketPriority;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class StoreTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Staff creating a ticket must say who it's for; a subscriber
            // creating their own ticket has that inferred from their session.
            'subscriber_id' => [Rule::requiredIf(fn () => ! $this->user('subscriber')), 'exists:subscribers,id'],
            'subject' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'priority' => ['sometimes', 'required', new Enum(TicketPriority::class)],
        ];
    }
}
