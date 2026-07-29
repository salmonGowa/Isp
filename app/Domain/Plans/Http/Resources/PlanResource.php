<?php

namespace App\Domain\Plans\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PlanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'download_mbps' => $this->download_mbps,
            'upload_mbps' => $this->upload_mbps,
            'price' => (float) $this->price,
            'status' => $this->status->value,
            'subscribers_count' => $this->whenCounted('subscribers'),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
