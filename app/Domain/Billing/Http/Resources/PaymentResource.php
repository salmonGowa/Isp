<?php

namespace App\Domain\Billing\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'invoice_id' => $this->invoice_id,
            'amount' => (float) $this->amount,
            'method' => $this->method,
            'reference' => $this->reference,
            'status' => $this->status->value,
            'invoice' => $this->whenLoaded('invoice', fn () => [
                'id' => $this->invoice->id,
                'amount' => (float) $this->invoice->amount,
                'status' => $this->invoice->status->value,
                'subscriber' => $this->invoice->relationLoaded('subscriber') && $this->invoice->subscriber
                    ? ['id' => $this->invoice->subscriber->id, 'name' => $this->invoice->subscriber->name]
                    : null,
            ]),
            'reviewed_at' => $this->reviewed_at?->toIso8601String(),
            'paid_at' => $this->paid_at?->toIso8601String(),
        ];
    }
}
