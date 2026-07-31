<?php

namespace App\Domain\Hotspot\Contracts;

use App\Domain\Hotspot\Models\HotspotSession;

interface HotspotAccessProviderContract
{
    /**
     * Authorize the session's MAC address on the hotspot network.
     */
    public function authorizeDevice(HotspotSession $session): void;

    /**
     * Cut off the session's MAC address from the hotspot network.
     */
    public function revokeDevice(HotspotSession $session): void;
}
