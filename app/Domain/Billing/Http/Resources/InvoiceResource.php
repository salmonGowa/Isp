<?php

namespace App\Domain\Billing\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InvoiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'subscriber_id' => $this->subscriber_id,
            'subscriber' => $this->whenLoaded('subscriber', fn () => [
                'id' => $this->subscriber->id,
                'name' => $this->subscriber->name,
            ]),
            'amount' => (float) $this->amount,
            'status' => $this->status->value,
            'issued_at' => $this->issued_at?->toIso8601String(),
            'due_at' => $this->due_at?->toIso8601String(),
            'paid_at' => $this->paid_at?->toIso8601String(),
            'payments' => PaymentResource::collection($this->whenLoaded('payments')),
        ];
    }
}
