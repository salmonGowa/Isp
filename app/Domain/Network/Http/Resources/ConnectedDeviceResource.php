<?php

namespace App\Domain\Network\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConnectedDeviceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'type' => $this->type->value,
            'ip_address' => $this->ip_address,
            'connected_since' => $this->connected_since?->toIso8601String(),
            'usage_gb_cycle' => (float) $this->usage_gb_cycle,
            'is_paused' => (bool) $this->is_paused,
        ];
    }
}
