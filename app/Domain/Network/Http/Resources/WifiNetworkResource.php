<?php

namespace App\Domain\Network\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WifiNetworkResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'ssid' => $this->ssid,
            'wifi_password' => $this->wifi_password,
            'password_updated_at' => $this->password_updated_at?->toIso8601String(),
        ];
    }
}
