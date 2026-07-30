<?php

namespace App\Domain\Network\Http\Controllers;

use App\Domain\Network\Http\Resources\WifiNetworkResource;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class WifiController extends Controller
{
    public function show(Request $request)
    {
        return new WifiNetworkResource($this->networkFor($request));
    }

    public function regeneratePassword(Request $request)
    {
        $network = $this->networkFor($request);
        $network->update([
            'wifi_password' => Str::password(12),
            'password_updated_at' => now(),
        ]);

        return new WifiNetworkResource($network);
    }

    private function networkFor(Request $request)
    {
        $subscriber = $request->user('subscriber');

        return $subscriber->wifiNetwork()->firstOrCreate([], [
            'tenant_id' => $subscriber->tenant_id,
            'ssid' => "{$subscriber->name}-Home",
            'wifi_password' => Str::password(12),
        ]);
    }
}
