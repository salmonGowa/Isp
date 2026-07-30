<?php

namespace App\Domain\FieldOps\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WorkOrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type->value,
            'target' => $this->subscriber_id
                ? ['subscriber_id' => $this->subscriber_id, 'name' => $this->whenLoaded('subscriber', fn () => $this->subscriber->name)]
                : ['lead_name' => $this->lead_name],
            'address' => $this->address,
            'technician_id' => $this->technician_id,
            'technician' => $this->whenLoaded('technician', fn () => $this->technician ? [
                'id' => $this->technician->id,
                'name' => $this->technician->relationLoaded('user') ? $this->technician->user->name : null,
            ] : null),
            'scheduled_at' => $this->scheduled_at?->toIso8601String(),
            'status' => $this->status->value,
            'completed_at' => $this->completed_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
