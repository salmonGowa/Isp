<?php

namespace App\Domain\Subscribers\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubscriberResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'plan_id' => $this->plan_id,
            'plan' => $this->whenLoaded('plan', fn () => [
                'id' => $this->plan->id,
                'name' => $this->plan->name,
            ]),
            'status' => $this->status->value,
            'service_address' => $this->service_address,
            'zone' => $this->zone,
            'monthly_bill' => (float) $this->monthly_bill,
            'joined_at' => $this->joined_at?->toIso8601String(),
            'last_payment_at' => $this->last_payment_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
