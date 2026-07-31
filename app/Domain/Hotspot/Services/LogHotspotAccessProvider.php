<?php

namespace App\Domain\Hotspot\Services;

use App\Domain\Hotspot\Contracts\HotspotAccessProviderContract;
use App\Domain\Hotspot\Models\HotspotSession;
use Illuminate\Support\Facades\Log;

/**
 * No-op stand-in for a real captive-portal/AP controller integration. There's
 * no physical hotspot hardware in this environment yet — this just logs
 * intent so the purchase/revoke flow can be built and tested now.
 *
 * TODO: replace with a driver that talks to the real AP controller (e.g. a
 * Mikrotik hotspot "walled garden"/user-manager API call, a CoovaChilli/
 * pfSense captive-portal API call, or a RADIUS CoA disconnect-message) once
 * real hotspot hardware is deployed.
 */
class LogHotspotAccessProvider implements HotspotAccessProviderContract
{
    public function authorizeDevice(HotspotSession $session): void
    {
        Log::info('[HOTSPOT-STUB] Would authorize device on hotspot network', [
            'session_id' => $session->id,
            'mac_address' => $session->mac_address,
            'expires_at' => $session->expires_at?->toIso8601String(),
        ]);
    }

    public function revokeDevice(HotspotSession $session): void
    {
        Log::info('[HOTSPOT-STUB] Would revoke device from hotspot network', [
            'session_id' => $session->id,
            'mac_address' => $session->mac_address,
        ]);
    }
}
