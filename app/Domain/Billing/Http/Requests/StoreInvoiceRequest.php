<?php

namespace App\Domain\Billing\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreInvoiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'subscriber_id' => ['required', 'exists:subscribers,id'],
            'amount' => ['required', 'numeric', 'min:0'],
            'due_at' => ['required', 'date'],
        ];
    }
}
