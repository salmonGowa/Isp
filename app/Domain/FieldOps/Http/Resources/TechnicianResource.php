<?php

namespace App\Domain\FieldOps\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TechnicianResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'name' => $this->whenLoaded('user', fn () => $this->user->name),
            'status' => $this->status->value,
            'zone' => $this->zone,
            'current_job_description' => $this->current_job_description,
            'jobs_done_today' => (int) ($this->jobs_done_today ?? 0),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
