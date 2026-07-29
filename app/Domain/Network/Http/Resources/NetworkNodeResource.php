<?php

namespace App\Domain\Network\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NetworkNodeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'identifier' => $this->identifier,
            'type' => $this->type->value,
            'zone' => $this->zone,
            'status' => $this->status->value,
            'uptime_pct' => (float) $this->uptime_pct,
            'load_pct' => (float) $this->load_pct,
            'subscriber_count' => $this->subscriber_count,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
