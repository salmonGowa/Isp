<?php

namespace App\Domain\Hotspot\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HotspotPlanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'duration_minutes' => $this->duration_minutes,
            'price' => (float) $this->price,
            'status' => $this->status->value,
            'sessions_count' => $this->whenCounted('sessions'),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
